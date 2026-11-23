import type { Request, Response } from "express";
import {
  signUpSchema,
  otpSchema,
  signInSchema,
  resendOtpSchema,
  forgetPasswordSchema,
  forgetPassword2Schema,
  resetPasswordSchema,
} from "../utils/zodshema.js";
import { db } from "../src/index.js";
import { usersTable } from "../src/db/schema.js";
import { eq } from "drizzle-orm";
import { passwordHasher, verifyPassword } from "../utils/bcrpt.js";
import { generateOtp } from "../utils/otp.js";
import { sendOtp } from "../utils/emailService.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyRefreshToken,
} from "../utils/token.js";
import {
  accessCookieOptions,
  refreshCookieOptions,
  clearCookieOptions,
} from "../utils/cookies.js";
import env from "../config/env.js";

// function createTokenPair(user: { id: string; email: string }) {
//   return {
//     accessToken: generateAccessToken(user),
//     refreshToken: generateRefreshToken(user),
//   };
// }

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

    const firstName: string =
      validatedRequest.data.fullName.trim().split(/\s+/)[0] ?? "";

    const hashedOtp = await passwordHasher(otp);

    const otpLifeSpan = 10 * 60 * 1000; // this is equivalent to 10 min in calculation
    // function createTokenPair(user: { id: string; email: string }) {
    //   return {
    //     accessToken: generateAccessToken(user),
    //     refreshToken: generateRefreshToken(user),
    //   };
    // }
    const sentAt = new Date();
    
    const expireAt = new Date(sentAt.getTime() + otpLifeSpan);
    
    try {
      await sendOtp(validatedRequest.data.email, firstName, otp);
    } catch (error) {
      console.error("Signup OTP email failed:", {
        message: error instanceof Error ? error.message : String(error),
      });
      return res.status(503).json({
        code: "OTP_EMAIL_SEND_FAILED",
        message:
          "We couldn't send your verification email. Please try signing up again in a moment.",
      });
    }

    await db.insert(usersTable).values({
      fullName: validatedRequest.data.fullName,
      email: validatedRequest.data.email,
      password: hashedPassword,
      level: validatedRequest.data.level,
      department: validatedRequest.data.department,
      phoneNumber: validatedRequest.data.phoneNumber,
      otp: hashedOtp,
      expiresAt: expireAt,
      lastOtpSentAt: sentAt,
      isEmailVerified: false,
    });


    console.log("Account created");
    
    return res.status(201).json({
      message:
        "Your account have be created Successfully!, Check your email for verification OTP",
    });
  } catch (error) {
    console.log("this error is from the signup catch: ", error);
    return res.status(500).json({ message: "Error Creating Account" });
  }
};

export const otpVerification = async (req: Request, res: Response) => {
  try {
    // console.log(req.body)
    const validatedRequest = otpSchema.safeParse(req.body);

    if (!validatedRequest.success) {
      console.log("otp zod error: ", validatedRequest.error);
      return res.status(400).json({ message: "Bad request" });
    }

    // console.log(validatedRequest)

    const validatedEmail = validatedRequest.data.email;

    const validatedOtp = validatedRequest.data.otp;

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, validatedEmail));

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

    if (!userData.otp) {
      return res.status(400).json({ message: "No OTP found" });
    }

    if (!userData.expiresAt || new Date() > userData.expiresAt) {
      console.log("otp has already expired");
      return res.status(400).json({ message: "OTP has expired" });
    }

    const isOtpValid = await verifyPassword(validatedOtp, userData.otp);

    if (!isOtpValid) {
      console.log("invaid otp");

      return res.status(400).json({ message: "Invalid OTP" });
    }

    await db
      .update(usersTable)
      .set({ isEmailVerified: true, otp: null, expiresAt: null })
      .where(eq(usersTable.email, validatedEmail));

    const accessToken = generateAccessToken(userData);

    const refreshToken = generateRefreshToken(userData);

    await db
      .update(usersTable)
      .set({ refreshToken: hashToken(refreshToken) })
      .where(eq(usersTable.id, userData.id));

    console.log("Email verified successfully");

    return res
      .status(200)
      .cookie("accessToken", accessToken, accessCookieOptions)
      .cookie("refreshToken", refreshToken, refreshCookieOptions)
      .json({
        message: "Email verified successfully",
        user: { id: userData.id, email: userData.email, role: userData.role },
        accessToken,
      });
  } catch (error) {
    console.log("otpVerification error: ", error);
    return res.status(500).json({ message: "error verifying otp" });
  }
};

export const signIn = async (req: Request, res: Response) => {
  try {
    const request = signInSchema.safeParse(req.body);

    if (!request.success) {
      console.log("signIn zod error: ", request.error);
      return res.status(400).json({ message: "Bad request" });
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, request.data.email));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({ message: "Email not verified" });
    }

    const isPasswordValid = await verifyPassword(
      request.data.password,
      user.password,
    );

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const accessToken = generateAccessToken(user);

    const refreshToken = generateRefreshToken(user);

    await db
      .update(usersTable)
      .set({ refreshToken: hashToken(refreshToken) })
      .where(eq(usersTable.id, user.id));

    return res
      .status(200)
      .cookie("accessToken", accessToken, accessCookieOptions)
      .cookie("refreshToken", refreshToken, refreshCookieOptions)
      .json({
        user: { id: user.id, email: user.email },
        accessToken,
        message: "Logged in successfully",
      });
  } catch (error) {
    console.log("signIn error: ", error);
    return res.status(500).json({ message: "error signing in" });
  }
};

export const refreshSession = async (req: Request, res: Response) => {
  const refreshToken: unknown = req.cookies?.refreshToken;

  if (typeof refreshToken !== "string" || !refreshToken) {
    res.clearCookie("accessToken", clearCookieOptions);
    res.clearCookie("refreshToken", clearCookieOptions);
    res.status(401).json({ message: "Refresh token required" });
    return;
  }

  let userId: string;

  try {
    userId = verifyRefreshToken(refreshToken).sub;
  } catch {
    res.clearCookie("accessToken", clearCookieOptions);
    res.clearCookie("refreshToken", clearCookieOptions);
    res.status(401).json({ message: "Invalid or expired refresh token" });
    return;
  }

  try {
    const [user] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        fullName: usersTable.fullName,
        role: usersTable.role,
        refreshToken: usersTable.refreshToken,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user || user.refreshToken !== hashToken(refreshToken)) {
      res.clearCookie("accessToken", clearCookieOptions);
      res.clearCookie("refreshToken", clearCookieOptions);
      res.status(401).json({ message: "Invalid or expired refresh token" });
      return;
    }

    const accessToken = generateAccessToken(user);
    const rotatedRefreshToken = generateRefreshToken(user);

    await db
      .update(usersTable)
      .set({ refreshToken: hashToken(rotatedRefreshToken) })
      .where(eq(usersTable.id, user.id));

    res
      .status(200)
      .cookie("accessToken", accessToken, accessCookieOptions)
      .cookie("refreshToken", rotatedRefreshToken, refreshCookieOptions)
      .json({
        message: "Session refreshed",
        user: { id: user.id, email: user.email },
        accessToken,
      });
  } catch (error) {
    console.error("refreshSession error:", error);
    res.status(500).json({ message: "Unable to refresh session" });
  }
};

export const resendOtp = async (req: Request, res: Response) => {
  try {
    const request = resendOtpSchema.safeParse(req.body);

    if (!request.success) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const { email } = request.data;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Account already verified" });
    }

    const COOLDOWN_MS = 60 * 1000;
    if (
      user.lastOtpSentAt &&
      Date.now() - new Date(user.lastOtpSentAt).getTime() < COOLDOWN_MS
    ) {
      return res
        .status(429)
        .json({ message: "Wait before requesting another OTP" });
    }

    const otp = generateOtp();
    const hashedOtp = await passwordHasher(otp);
    const now = new Date();

    await db
      .update(usersTable)
      .set({
        otp: hashedOtp,
        expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
        lastOtpSentAt: now,
      })
      .where(eq(usersTable.id, user.id));

    const firstName = user.fullName.trim().split(/\s+/)[0] ?? "";
    await sendOtp(user.email, firstName, otp);

    return res
      .status(200)
      .json({ message: "A new OTP has been sent to your email" });
  } catch (error) {
    console.log("resendOtp error: ", error);
    return res.status(500).json({ message: "Error resending OTP, try again" });
  }
};


export const forgetPassword1 = async (req: Request, res: Response) => {
  try {
    const request = forgetPasswordSchema.safeParse(req.body);

    if (!request.success) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const { email } = request.data;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const COOLDOWN_MS = 60 * 1000;

    if ( user.lastOtpSentAt && Date.now() - new Date(user.lastOtpSentAt).getTime() < COOLDOWN_MS ) {
      return res.status(429).json({ message: "Wait before requesting another code" });
    }

    const otp = generateOtp();

    const hashedOtp = await passwordHasher(otp);

    await db.update(usersTable).set({
        otp: hashedOtp,
        lastOtpSentAt: new Date(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      }).where(eq(usersTable.id, user.id));

    const firstName = user.fullName.trim().split(/\s+/)[0] ?? "";
    
    await sendOtp(user.email, firstName, otp);

    return res.status(200).json({ message: "If that email exists, a reset code has been sent" });
  } catch (error) {
    console.log("forgetPassword error: ", error);
    return res.status(500).json({ message: "Error processing request" });
  }
};


export const forgetPassword2 = async (req: Request, res: Response) => {
  try {
      const request = forgetPassword2Schema.safeParse(req.body);

      if (!request.success) {
          return res.status(400).json({ message: "Invalid request" });
      }

      const { email, otp } = request.data;

      const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      if (!user.otp) {
          return res.status(400).json({ message: "No OTP found for this user" });
      }

      if (!user.expiresAt || new Date() > user.expiresAt) {
            return res.status(400).json({ message: "OTP has expired" });
      }

      const isOtpValid = await verifyPassword(otp, user.otp);

      if (!isOtpValid) {
          return res.status(400).json({ message: "Invalid OTP" });
      }

      return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.log("forgetPassword2 Error: ", error)
    res.status(500).json({ message: "Error proccessing request at forgetPassword step 2" })
  }
}

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const request = resetPasswordSchema.safeParse(req.body);

    if (!request.success) {
      console.log("resetPassword zod error: ", request.error);
      return res.status(400).json({ message: "Invalid request" });
    }

    const { email, password, otp } = request.data;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.otp) {
      return res.status(400).json({ message: "Verification code is required" });
    }

    if (!user.expiresAt || new Date() > user.expiresAt) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    const isOtpValid = await verifyPassword(otp, user.otp);
    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const hashedPassword = await passwordHasher(password);

    await db.update(usersTable).set({
      password: hashedPassword,
      otp: null,
      expiresAt: null,
      lastOtpSentAt: null,
    }).where(eq(usersTable.id, user.id));

    return res.status(200).json({ message: "Password reset successfully" });
    
  } catch (error) {
    console.log("resetPassword Error: ", error)
    res.status(500).json({ message: "Error proccessing request at resetPassword step" })
    
  }
}