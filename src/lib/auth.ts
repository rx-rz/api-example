import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import * as schema from "../db/schema";
import { createId } from "@paralleldrive/cuid2";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/db";
import { env } from "../utils/env-vars";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    maxPasswordLength: 100,
    minPasswordLength: 8,
    requireEmailVerification: false,
  },
  plugins: [username({ maxUsernameLength: 50, minUsernameLength: 3 })],
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
      redirectURI: env.GOOGLE_REDIRECT_URI,
    },
  },
  basePath: "/api/v1/auth",

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  advanced: {
    cookiePrefix: "api-example",
    cookies: {
      session_token: {
        name: "session_token",
        attributes: {
          secure: env.NODE_ENV === "production",
          sameSite: "lax",
        },
      },
    },
    database: {
      generateId: createId,
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
export type AuthType = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};
