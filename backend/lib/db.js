import { configDotenv } from "dotenv"
import mongoose from "mongoose"
configDotenv()

export const connectDb = async (params) => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Database connected successfully")
    } catch (error) {
        console.log("Failed to connect to DB", error)
        process.exit()
    }
}