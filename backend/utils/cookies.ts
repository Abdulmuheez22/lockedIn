import type { CookieOptions } from "express";
import env  from "../config/env.js";
import { REFRESH_TOKEN_TTL_S, ACCESS_TOKEN_TTL_S } from "./token.js";


const base: CookieOptions = {
 httpOnly: true,
 secure: env.isProd, // `secure` cookies need HTTPS, so only in production
 sameSite: "lax",
};

export const accessCookieOptions: CookieOptions = { ...base, maxAge: ACCESS_TOKEN_TTL_S * 1000 };

export const refreshCookieOptions: CookieOptions = { ...base, maxAge: REFRESH_TOKEN_TTL_S * 1000, };

export const clearCookieOptions: CookieOptions = base;