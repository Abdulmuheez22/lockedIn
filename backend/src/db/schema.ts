import { boolean, uuid } from "drizzle-orm/pg-core";
import { integer, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  fullName: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  role: varchar({ length: 255 }).notNull().default("member"),
  password: varchar({ length: 255 }).notNull(),
  level: varchar({ length: 255 }).notNull(),
  department: varchar( {length: 255 }).notNull(),
  phoneNumber: varchar({ length: 255 }).notNull(),
  otp: varchar({ length: 255 }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  isEmailVerified: boolean().default(false).notNull(),
  refreshToken: varchar({ length: 255 }),
});

