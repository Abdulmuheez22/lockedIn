import type { Request, Response } from "express";
import { dpfSchema } from "../utils/zodshema.js";
import { db } from "../src/index.js";
import { usersTable, dpfTable } from "../src/db/schema.js";
import { eq } from "drizzle-orm";

export const dpfRegistrationHandler = async (req: Request, res: Response) => {
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

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const entryDate = new Date().toLocaleDateString("en-CA", {
      timeZone: "Africa/Lagos",
    });

    await db.insert(dpfTable).values({
      userId: user.id,
      entryDate: entryDate,
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
    console.error("dpfRegistrationHandler error:", error);
    res.status(500).json({ message: "Error registering DPf" });
  }
};
