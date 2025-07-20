import { config } from "dotenv";
config();
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { Pool } from "pg";

export const db = drizzle(
  new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  { schema }
);
