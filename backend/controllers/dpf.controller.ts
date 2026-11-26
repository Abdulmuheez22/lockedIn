import type { Request, Response } from "express";
import { dpfSchema } from "../utils/zodshema.js";
import { db } from "../src/index.js";
import { dpfTable } from "../src/db/schema.js";
import { desc, eq } from "drizzle-orm";

const getTodayEntryDate = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });

const shiftEntryDate = (entryDate: string, days: number) => {
  const date = new Date(`${entryDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const getCurrentStreak = (entryDates: string[]) => {
  const dates = new Set(entryDates);
  let dateToCheck = getTodayEntryDate();

  if (!dates.has(dateToCheck)) dateToCheck = shiftEntryDate(dateToCheck, -1);

  let streak = 0;
  while (dates.has(dateToCheck)) {
    streak += 1;
    dateToCheck = shiftEntryDate(dateToCheck, -1);
  }
  return streak;
};

export const dpfRegistrationHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const request = dpfSchema.safeParse(req.body);

    if (!request.success) {
      console.log("Invalid DPf data: ", request.error);
      return res.status(400).json({ message: "Invalid DPf data" });
    }

    const dpfData = request.data;

    await db.insert(dpfTable).values({
      userId,
      entryDate: getTodayEntryDate(),
      studyMinutes: dpfData.studyMinutes,
      coursesStudied: dpfData.coursesStudied,
      studyMethods: dpfData.studyMethods,
      studyTechniques: dpfData.studyTechniques,
      focusLevel: dpfData.focusLevel,
      emotionalState: dpfData.emotionalState,
      understanding: dpfData.understanding,
      challengeFaced: dpfData.challengeFaced,
      whatWentWell: dpfData.whatWentWell,
      whatToImprove: dpfData.whatToImprove,
      nextDayPlan: dpfData.nextDayPlan ?? null,
    });

    return res.status(201).json({ message: "DPF registered successfully" });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return res.status(409).json({
        message:
          "Your Daily Performance Form for today has already been submitted. Please return tomorrow to complete your next entry.",
      });
    }

    console.error("dpfRegistrationHandler error:", error);
    return res.status(500).json({ message: "Error registering DPF" });
  }
};

export const fetchTodayDpfStatusHandler = async ( req: Request, res: Response, ) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const entries = await db
      .select({ entryDate: dpfTable.entryDate })
      .from(dpfTable)
      .where(eq(dpfTable.userId, userId));

    const entryDates = entries.map((entry) => entry.entryDate);
    return res.status(200).json({
      logged: entryDates.includes(getTodayEntryDate()),
      streak: getCurrentStreak(entryDates),
    });
  } catch (error) {
    console.error("fetchTodayDpfStatusHandler error:", error);
    return res.status(500).json({ message: "Error checking today's DPF status" });
  }
};

export const fetchDpfAnalyticsHandler = async ( req: Request, res: Response ) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const entries = await db.select({
        id: dpfTable.id,
        entryDate: dpfTable.entryDate,
        studyMinutes: dpfTable.studyMinutes,
        coursesStudied: dpfTable.coursesStudied,
        studyMethods: dpfTable.studyMethods,
        studyTechniques: dpfTable.studyTechniques,
        focusLevel: dpfTable.focusLevel,
        emotionalState: dpfTable.emotionalState,
        understanding: dpfTable.understanding,
        challengeFaced: dpfTable.challengeFaced,
        whatWentWell: dpfTable.whatWentWell,
        whatToImprove: dpfTable.whatToImprove,
        nextDayPlan: dpfTable.nextDayPlan,
      }).from(dpfTable).where(eq(dpfTable.userId, userId)).orderBy(desc(dpfTable.entryDate));

    return res.status(200).json({ entries });
  } catch (error) {
    console.error("fetchDpfAnalyticsHandler error:", error);
    return res.status(500).json({ message: "Error fetching DPF analytics" });
  }
};
