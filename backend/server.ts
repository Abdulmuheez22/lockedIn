import express from "express"
import env from "./config/env.js";
import auth from "./routes/auth.route.js";

const app = express();

app.use("/api/auth", auth)

const port = env.port;

app.listen(port, () => console.log(`LockedIn Circle server is running on http://localhost:${port}`));
