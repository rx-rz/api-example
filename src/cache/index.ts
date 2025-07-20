import Redis from "ioredis";
import { env } from "../utils/env-vars";

export const redisClient = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD ?? "",
  maxRetriesPerRequest: null,
});

redisClient.on("connect", () => console.log("Redis: Connected successfully!"));
redisClient.on("ready", () => console.log("Redis: Ready to use!"));
redisClient.on("error", (err) =>
  console.error("Redis: Connection Error -", err)
);
redisClient.on("close", () => console.log("Redis: Connection closed."));
redisClient.on("reconnecting", () => console.log("Redis: Reconnecting..."));
