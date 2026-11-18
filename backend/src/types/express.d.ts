import type { User } from "../db/schema.js";
export type SafeUser = Omit<User, "password" | "refreshToken">;
declare global {
 namespace Express {
 interface Request {
 user?: SafeUser;
 }
 }
}