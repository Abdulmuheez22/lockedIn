import { Router } from "express";
import { signUp } from "../controllers/auth.controller.js";

const auth = Router()

auth.post("/signUp", signUp)

export default auth