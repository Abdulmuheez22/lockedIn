import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db } from "../src/index.js";
import { usersTable } from "../src/db/schema.js";
import { verifyAccessToken } from "../utils/token.js";



function extractToken(req: Request): string | undefined {
  const cookieToken: unknown = req.cookies?.accessToken;
  if (typeof cookieToken === "string" && cookieToken) return cookieToken;
  const header = req.header("Authorization");
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return undefined;
}



export async function verifyJWT( req: Request, res: Response, next: NextFunction): Promise<void> {

  const token = extractToken(req);

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  
  let userId: string;

  try {
    userId = verifyAccessToken(token).sub;
  } catch {
    // bad signature, expired, malformed... all of these are "not authenticated"
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
  // const [user] = await db.select({ id: usersTable.id, email: usersTable.email}) .from(usersTable) .where(eq(usersTable.id, userId)) .limit(1);

  // if (!user) {
  //   res.status(401).json({ message: "Invalid or expired token" });
  //   return;
  // }

  (req as Request & { id: string }).id = userId;

  next();
}
