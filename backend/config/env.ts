import dotenv from "dotenv";

const isProd = process.env.NODE_ENV === 'production';
const min = 60 * 1000 ;
dotenv.config();

const env = {
  port: process.env.PORT,
  dburl: process.env.DATABASE_URL,
  smtpUser: process.env.SMTP_LOGIN,
  smtpPass: process.env.SMTP_PASSWORD,
  userEmail: process.env.USER_EMAIL,
isProd: process.env.NODE_ENV === "production",
 clientUrl: process.env.CLIENT_URL,
 databaseUrl: process.env.DATABASE_URL,
 accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
 refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  cookie: {
    name: "token",
    base: { httpOnly: true, secure: isProd, sameSite: "lax", path: "/" },
    maxAge: 10 * min, 
  },
};

export default env;
