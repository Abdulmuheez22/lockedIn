import express from "express"
import env from "./config/env.js";

const app = express();

const port = env.port;

app.listen(port, () => console.log(`LockedIn Circle server is running on http://localhost:${port}`));
