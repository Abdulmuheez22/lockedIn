import * as z from "zod"


const levels = [
  "100 Level",
  "200 Level",
  "300 Level",
  "400 Level",
  "500 Level",
  "600 Level",
  "700 Level",
] as const;

const fullName = z.string().trim().min(1).max(555);
const email = z.string().trim().max(255).pipe(z.email());
const password = z.string().min(6).max(255);
const level = z.enum(levels);
const department = z.string().trim().min(1).max(255);
const phoneNumber = z.string().trim().min(1).max(255);


export const signUpSchema = z.object({
    fullName,
    email,
    password,
    level,
    department,
    phoneNumber
})