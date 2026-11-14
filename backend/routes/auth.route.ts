import { Router } from "express";
import { signUp, otpVerification } from "../controllers/auth.controller.js";

const auth = Router()

auth.post("/signUp", signUp)
auth.post("/otpVerification", otpVerification)

export default auth