import { uuid } from "drizzle-orm/pg-core";
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  fullName: varchar({ length: 555 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  level: varchar({ length: 255 }).notNull(),
  department: varchar( {length: 255 }).notNull(),
  phoneNumber: varchar({ length: 255 }).notNull()
});

