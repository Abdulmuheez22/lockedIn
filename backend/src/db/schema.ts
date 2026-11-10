import { uuid } from "drizzle-orm/pg-core";
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 555 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});





// Full Name
// John Doe
// Email Address
// you@example.com
// Password
// ••••••••

// Confirm Password
// ••••••••

// Current Academic Level

// Select your level
// Department
// e.g. History & International Studies
// Phone Number(WhatsApp preferred)
