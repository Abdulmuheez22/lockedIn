import dotenv from "dotenv"

dotenv.config()

const env = {
    port: process.env.PORT,
    dburl: process.env.DATABASE_URL,
    smtpUser: process.env.SMTP_LOGIN,
    smtpPass: process.env.SMTP_PASSWORD,
    userEmail: process.env.USER_EMAIL
}

export default env


