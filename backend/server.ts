import cors from "cors"
import express from "express"
import cookieParser from "cookie-parser";
import env from "./config/env.js";
import auth from "./routes/auth.route.js";
import endpointlogger from "./middleware/endpointlogger.js";
import dpfRouter from "./routes/dpf.route.js";
import memberDashboardRouter from "./routes/memberdashboard.route.js";

const app = express();


app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json())
app.use(cookieParser())
app.use(endpointlogger)
app.use("/api/auth", auth)
app.use("/api/dpf", dpfRouter)
app.use("/api/dashboard/member", memberDashboardRouter)


const port = env.port;

app.listen(port, () => console.log(`LockedIn Circle server is running on http://localhost:${port}`));
