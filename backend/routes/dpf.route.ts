import { Router } from "express";
import { dpfRegistrationHandler } from "../controllers/dpf.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const dpfRouter = Router();

dpfRouter.post("/reg", verifyJWT, dpfRegistrationHandler);

export default dpfRouter;