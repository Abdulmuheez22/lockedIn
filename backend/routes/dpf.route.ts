import { Router } from "express";
import {
  fetchDpfAnalyticsHandler,
  dpfRegistrationHandler,
  fetchTodayDpfStatusHandler,
} from "../controllers/dpf.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const dpfRouter = Router();

dpfRouter.get("/analytics", verifyJWT, fetchDpfAnalyticsHandler);
dpfRouter.get("/today", verifyJWT, fetchTodayDpfStatusHandler);
dpfRouter.post("/reg", verifyJWT, dpfRegistrationHandler);

export default dpfRouter;