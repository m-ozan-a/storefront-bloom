import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002",
    process.env.NEXT_PUBLIC_OWUAN_API_URL || "http://localhost:3000",
  ].filter(Boolean),
});
