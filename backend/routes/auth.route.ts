import { Router } from "express";
import {
  signUp,
  otpVerification,
  signIn,
  resendOtp,
  forgetPassword1,
  forgetPassword2,
  resetPassword,
} from "../controllers/auth.controller.js";

const auth = Router();

auth.post("/signUp", signUp);

auth.post("/otpVerification", otpVerification);

auth.post("/signIn", signIn);

auth.post("/resendOtp", resendOtp);

auth.post("/forgetPassword1", forgetPassword1);

auth.post("/forgetPassword2", forgetPassword2);

auth.post("/resetPassword", resetPassword);

export default auth;
