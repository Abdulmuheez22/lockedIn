import { Router} from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { fetchUserData } from "../controllers/memberdashboard.controller.js";

const memberDashboardRouter = Router();

memberDashboardRouter.get("/fetchUserData", verifyJWT, fetchUserData)

export default memberDashboardRouter;