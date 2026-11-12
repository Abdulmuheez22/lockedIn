// utils/otp.ts
import { randomInt, createHash } from "crypto";

export const generateOtp = () =>
  randomInt(0, 1_000_000).toString().padStart(6, "0");

// export const hashOtp = (otp: string) =>
//   createHash("sha256").update(otp).digest("hex");