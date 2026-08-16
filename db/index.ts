import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const DATABASE_URL =
  process.env.STOREFRONT_TENANT_DATABASE_URL ||
  process.env.DATABASE_URL ||
  "file:./data/storefront.db";

const AUTH_TOKEN =
  process.env.STOREFRONT_TENANT_DATABASE_AUTH_TOKEN ||
  process.env.DATABASE_AUTH_TOKEN ||
  undefined;

const client = createClient({ url: DATABASE_URL, authToken: AUTH_TOKEN });
export const db = drizzle(client, { schema });
