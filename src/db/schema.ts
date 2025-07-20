import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  uniqueIndex,
  index,
  pgEnum,
  text,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { cuid2 } from "drizzle-cuid2/postgres";

export const roleEnum = pgEnum("role", [
  "CREATIVE",
  "BRAND",
  "INVESTOR",
  "ADMIN",
]);
export const userStatusEnum = pgEnum("user_status", [
  "ACTIVE",
  "SUSPENDED",
  "DELETED",
]);

export const user = pgTable(
  "user",
  {
    id: cuid2("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull(),
    emailVerified: boolean("email_verified").notNull(),
    image: varchar("image", { length: 1024 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    username: varchar("username", { length: 100 }).notNull(),
    displayUsername: varchar("display_username", { length: 100 }),
    role: roleEnum("role").notNull(),
    status: userStatusEnum("status").notNull().default("ACTIVE"),
  },
  (t) => [
    uniqueIndex("user_email_unique").on(t.email),
    uniqueIndex("user_username_unique").on(t.username),
    index("user_username_idx").on(t.username),
  ]
);

export const session = pgTable(
  "session",
  {
    id: cuid2("id").primaryKey().defaultRandom(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    ipAddress: varchar("ip_address", { length: 255 }),
    userAgent: text("user_agent"),
    userId: varchar("user_id", { length: 24 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [uniqueIndex("session_token_unique").on(t.token)]
);

export const account = pgTable("account", {
  id: cuid2("id").primaryKey().defaultRandom(),
  accountId: varchar("account_id", { length: 255 }).notNull(),
  providerId: varchar("provider_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 24 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", {
    withTimezone: true,
  }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
    withTimezone: true,
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const verification = pgTable("verification", {
  id: cuid2("id").primaryKey().defaultRandom(),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  value: varchar("value", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const reservedUsername = pgTable("reserved_usernames", {
  username: varchar("username", { length: 30 }).primaryKey(),
  reservedAt: timestamp("reserved_at").notNull().defaultNow(),
  reservationToken: uuid("reservation_token").notNull().defaultRandom(),
});

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
