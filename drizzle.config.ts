import { defineConfig } from "drizzle-kit";
import { env } from "./src/utils/env-vars";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DB_URL,
  },
  verbose: true,
  strict: true,
});
