CREATE TYPE "challenge" AS ENUM('Time Management', 'Distractions', 'Lack of Motivation', 'Difficulty Understanding Material', 'Procrastination', 'Burnout', 'Nothing', 'unavailability of material');--> statement-breakpoint
CREATE TYPE "emotionalState" AS ENUM('Motivated', 'Neutral', 'Frustrated', 'Anxious', 'Excited', 'Bored');--> statement-breakpoint
CREATE TYPE "focusLevel" AS ENUM('Very focused', 'Somewhat focused', 'Distracted');--> statement-breakpoint
CREATE TYPE "planCompleted" AS ENUM('Yes', 'Partially', 'No');--> statement-breakpoint
CREATE TYPE "studyMethod" AS ENUM('Reading', 'Note Taking', 'Revision', 'Practice', 'Watching Videos', 'Group Study', 'Teaching Others');--> statement-breakpoint
CREATE TYPE "studyTechnique" AS ENUM('Pomodoro', 'Active Recall', 'Spaced Repetition', 'Feynman Technique', 'Mind Mapping', 'SQ3R Method', 'Cornell Note-Taking System', 'Self-Explanation');--> statement-breakpoint
CREATE TYPE "understanding" AS ENUM('Very clear', 'Somewhat clear', 'Confused', 'Lost');--> statement-breakpoint
CREATE TABLE "dpf" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"userId" uuid NOT NULL,
	"entryDate" date NOT NULL,
	"studyMinutes" integer NOT NULL,
	"coursesStudied" text[] NOT NULL,
	"studyMethods" "studyMethod"[] NOT NULL,
	"studyTechniques" "studyTechnique"[] NOT NULL,
	"focusLevel" "focusLevel" NOT NULL,
	"emotionalState" "emotionalState" NOT NULL,
	"understanding" "understanding" NOT NULL,
	"challengeFaced" "challenge" NOT NULL,
	"whatWentWell" text NOT NULL,
	"whatToImprove" text NOT NULL,
	"nextDayPlan" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dpf_user_date_unique" UNIQUE("userId","entryDate")
);
--> statement-breakpoint

ALTER TABLE "dpf" ADD CONSTRAINT "dpf_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;