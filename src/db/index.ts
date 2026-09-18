import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Vercel's Postgres/Neon integration injects several aliases depending on how
// the database was provisioned — accept any of the common ones.
const connectionString =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.POSTGRES_URL_NON_POOLING;

if (!connectionString) {
  throw new Error(
    "No database connection string found. Set DATABASE_URL (or connect a Postgres database to this Vercel project) in your environment variables.",
  );
}

const sql = neon(connectionString);

export const db = drizzle(sql, { schema });
