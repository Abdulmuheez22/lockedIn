import type { Request, Response } from "express";
import { signUpSchema, otpSchema } from "../utils/zodshema.js";
import { db } from "../src/index.js";
import { usersTable } from "../src/db/schema.js";
import { eq } from "drizzle-orm";
import { passwordHasher, verifyPassword } from "../utils/bcrpt.js";
import { generateOtp } from "../utils/otp.js";
import { sendOtp } from "../utils/emailService.js";

export const signUp = async (req: Request, res: Response) => {
  try {
    const validatedRequest = signUpSchema.safeParse(req.body);

    if (!validatedRequest.success) {
      console.log("error validating user in signup");
      return res.status(400).json({ meesage: "Bad request" });
    }
    const checkEmail = await db
      .select({ email: usersTable.email })
      .from(usersTable)
      .where(eq(usersTable.email, validatedRequest.data.email));

    if (checkEmail.length > 0) {
      return res
        .status(409)
        .json({ message: "Email already used by an Active user" });
    }

    const hashedPassword = await passwordHasher(validatedRequest.data.password);

    const otp = generateOtp();

    const firstName: string = validatedRequest.data.fullName.trim().split(/\s+/)[0] ?? "";

    const hashedOtp = await passwordHasher(otp);

    const otpLifeSpan = 10 * 60 * 1000; // this is equivalent to 10 min in calculation

    const expireAt = new Date(Date.now() + otpLifeSpan);

    await db.insert(usersTable).values({
      fullName: validatedRequest.data.fullName,
      email: validatedRequest.data.email,
      password: hashedPassword,
      level: validatedRequest.data.level,
      department: validatedRequest.data.department,
      phoneNumber: validatedRequest.data.phoneNumber,
      otp: hashedOtp,
      expiresAt: expireAt,
      isEmailVerified: false,
    });
 
    // send otp here.
    await sendOtp(validatedRequest.data.email, firstName, otp);
    console.log('Account created')
    return res.status(201).json({ message: "Your account have be created Successfully!, Check your email for verification OTP" });
  } catch (error) {
    console.log("this error is from the signup catch: ", error);
    return res.status(500).json({ message: "Error Creating Account" });
  }
};


export const otpVerification = async (req: Request, res: Response) => {
  try {
    const validatedRequest = otpSchema.safeParse(req.body);

    if (!validatedRequest.success) {
      return res.status(400).json({ message: "Bad request" });
    }

    const validatedEmail = validatedRequest.data.email;

    const validatedOtp = validatedRequest.data.otp;

    const user = await db.select().from(usersTable).where(eq(usersTable.email, validatedEmail));

    if (!user || user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = user[0];

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userData.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if(!userData.otp) {
      return res.status(400).json({ message: "No OTP found" });
    }

    if(!userData.expiresAt || new Date() > userData.expiresAt) {
      return res.status(400).json({ message: "OTP has expired" });
    }
    
    const isOtpValid = await verifyPassword(validatedOtp, userData.otp);

    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await db.update(usersTable)
      .set({ isEmailVerified: true, otp: null, expiresAt: null })
      .where(eq(usersTable.email, validatedEmail));

    return res.status(200).json({ message: "Email verified successfully" });
    
  } catch (error) {
    console.log('otpVerification error: ', error)
    return res.status(500).json({ message: 'error verifying otp'})
  }
}