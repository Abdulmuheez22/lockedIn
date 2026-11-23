import { boolean, date, pgEnum, text, unique, uuid } from "drizzle-orm/pg-core";
import { integer, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  fullName: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  role: varchar({ length: 255 }).notNull().default("member"),
  password: varchar({ length: 255 }).notNull(),
  level: varchar({ length: 255 }).notNull(),
  department: varchar({ length: 255 }).notNull(),
  phoneNumber: varchar({ length: 255 }).notNull(),
  otp: varchar({ length: 255 }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  lastOtpSentAt: timestamp("last_otp_sent_at", { withTimezone: true }),
  isEmailVerified: boolean().default(false).notNull(),
  refreshToken: varchar({ length: 255 }),
});



export const studyTechniqueEnum = pgEnum("studyTechnique", [
  "Pomodoro",
  "Active Recall",
  "Spaced Repetition",
  "Feynman Technique",
  "Mind Mapping",
  "SQ3R Method",
  "Cornell Note-Taking System",
  "Self-Explanation",
]);

export const studyMethodEnum = pgEnum("studyMethod", [
  "Reading",
  "Note Taking",
  "Revision",
  "Practice",
  "Watching Videos",
  "Group Study",
  "Teaching Others",
]);

export const focusLevelEnum = pgEnum("focusLevel", [
  "Very focused",
  "Somewhat focused",
  "Distracted",
]);

export const emotionalStateEnum = pgEnum("emotionalState", [
  "Motivated",
  "Neutral",
  "Frustrated",
  "Anxious",
  "Excited",
  "Bored",
]);

export const understandingEnum = pgEnum("understanding", [
  "Very clear",
  "Somewhat clear",
  "Confused",
  "Lost",
]);

export const challengeEnum = pgEnum("challenge", [
  "Time Management",
  "Distractions",
  "Lack of Motivation",
  "Difficulty Understanding Material",
  "Procrastination",
  "Burnout",
  "Nothing",
  "unavailability of material",
]);

export const planCompletedEnum = pgEnum("planCompleted", [
  "Yes",
  "Partially",
  "No",
]);

export const dpfTable = pgTable( "dpf",{
  
    id: uuid().primaryKey().defaultRandom(),

    userId: uuid("userId").notNull().references(() => usersTable.id, { onDelete: "cascade" }),

    entryDate: date("entryDate").notNull(),

    studyMinutes: integer("studyMinutes").notNull(),

    coursesStudied: text("coursesStudied").array().notNull(),

    studyMethods: studyMethodEnum("studyMethods").array().notNull(),

    studyTechniques: studyTechniqueEnum("studyTechniques").array().notNull(),

    focusLevel: focusLevelEnum("focusLevel").notNull(),

    emotionalState: emotionalStateEnum("emotionalState").notNull(),

    understanding: understandingEnum("understanding").notNull(),

    challengeFaced: challengeEnum("challengeFaced").notNull(),

    whatWentWell: text("whatWentWell").notNull(),

    whatToImprove: text("whatToImprove").notNull(),

    nextDayPlan: text("nextDayPlan"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique("dpf_user_date_unique").on(t.userId, t.entryDate)],
);
