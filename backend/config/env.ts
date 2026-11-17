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
  jwtExpiresIn: "10min",
  jwtSecret: process.env.JWT_SECRET,
  cookie: {
    name: "token",
    base: { httpOnly: true, secure: isProd, sameSite: "lax", path: "/" },
    maxAge: 10 * min, 
  },
};

export default env;
