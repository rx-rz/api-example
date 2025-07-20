import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { redisClient } from "./cache";
import { auth } from "./lib/auth";
import { secureHeaders } from "hono/secure-headers";
import { db } from "./db/db";
import { sql } from "drizzle-orm";
import { onError } from "./lib/on-error";
import { loggingMiddleware } from "./api/middleware/logger";
import { rateLimit } from "./api/middleware/rate-limit";
import { globalRateLimiter } from "./rate-limiter";
import { storageRoutes } from "./api/storage/storage.routes";
import { ROUTES } from "./utils/routes";

const app = new Hono().basePath("/api/v1");

app.use(secureHeaders());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:8080",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:300",
    ],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    maxAge: 3600,
    exposeHeaders: ["Content-Range", "X-Content-Range"],
  })
);

app.use("*", loggingMiddleware);
app.use("*", rateLimit({ limiter: globalRateLimiter }));

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.on(["POST", "GET"], "/auth/**", (c) => {
  return auth.handler(c.req.raw);
});

app.route(ROUTES.storage.base, storageRoutes);

app.get(ROUTES.healthCheck, async (c) => {
  try {
    await redisClient.ping();
    await db.execute(sql`SELECT 1`);
    return c.json({ status: "healthy", timestamp: new Date().toISOString() });
  } catch (error: any) {
    console.error("Health check failed:", error);
    return c.json({ status: "unhealthy", error: error.message }, 500);
  }
});

app.onError((err, c) => {
  const { jsend, status } = onError(err, c);
  return c.json({ ...jsend }, status as any);
});

const handleTermination = (signal: NodeJS.Signals) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  process.exit(0);
};

process.on("SIGTERM", handleTermination);
process.on("SIGINT", handleTermination);
process.on("uncaughtException", (error) => {
  console.log(error);
  process.exit(1);
});

serve(
  {
    fetch: app.fetch,
    port: 4140,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
