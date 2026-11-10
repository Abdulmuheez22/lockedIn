import dotenv from "dotenv"

dotenv.config()

const env = {
    port: process.env.PORT,
    dburl: process.env.DATABASE_URL
}

export default env