import type { Request, Response } from "express";
import { db } from "../src/index.js";
import { usersTable } from "../src/db/schema.js";
import { eq } from "drizzle-orm";

export const fetchUserData = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized " });
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const frontendUserData = {
      fullname: user.fullName,
      email: user.email,
      role: user.role,
      level: user.level,
      department: user.department,
      phoneNumber: user.phoneNumber,
    };

    return res.status(200).json({userData : frontendUserData})
  } catch (error) {
    console.log("fetchUserData error: ", error);
    return res.status(500).json({ message: "Error fecthing user data" });
  }
};
