import { Router} from "express";
import { verifyAccessToken } from "../utils/token.js";
import { fetchUserData } from "../controllers/memberdashboard.controller.js";

const memberDashboardRouter = Router();

memberDashboardRouter.get("/fetchUserData", verifyAccessToken, fetchUserData)

export default memberDashboardRouter;