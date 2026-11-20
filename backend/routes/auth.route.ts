import { Router } from "express";
import { signUp, otpVerification, signIn, resendOtp, forgetPassword } from "../controllers/auth.controller.js";

const auth = Router()

auth.post("/signUp", signUp)

auth.post("/otpVerification", otpVerification)

auth.post("/signIn", signIn)

auth.post("/resendOtp", resendOtp)

auth.post("/forgetPassword", forgetPassword)

export default auth