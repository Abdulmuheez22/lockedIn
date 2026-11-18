import { createHash, randomUUID } from "node:crypto";
import jwt, { type JwtPayload } from "jsonwebtoken";
import env from "../config/env.js";

if(!env.accessTokenSecret || !env.refreshTokenSecret) {
    console.log("Missing access or refresh token secret in environment variables");
    }

export const ACCESS_TOKEN_TTL_S = 15 * 60; // 15 minutes

export const REFRESH_TOKEN_TTL_S = 15 * 24 * 60 * 60; // 15 days

export interface TokenPayload extends JwtPayload {
 sub: string; // user id
}


export function generateAccessToken(user: { id: string; email: string }): string {
 return jwt.sign({ email: user.email }, env.accessTokenSecret!, { subject: user.id, expiresIn: ACCESS_TOKEN_TTL_S, });
}



export function generateRefreshToken(user: { id: string }): string {
 return jwt.sign({}, env.refreshTokenSecret!, {
 subject: user.id,
 jwtid: randomUUID(),
 expiresIn: REFRESH_TOKEN_TTL_S,
 });
}
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;



function verify(token: string, secret: string): TokenPayload {
 const decoded = jwt.verify(token, secret);
 if (
 typeof decoded === "string" ||
 typeof decoded.sub !== "string" ||
 !UUID_RE.test(decoded.sub)
 ) {
    console.log("invalid token payload");
 }
 return decoded as TokenPayload;
}
export const verifyAccessToken = (token: string) => verify(token, env.accessTokenSecret!);

export const verifyRefreshToken = (token: string) => verify(token, env.refreshTokenSecret!);

export const hashToken = (token: string): string => createHash("sha256").update(token).digest("hex");