import express from "express"
import { configDotenv } from "dotenv"
import authRoutes from "./routes/auth.routes.js"
import productRoutes from "./routes/product.routes.js"
import cartRoutes from "./routes/cart.routes.js"
import couponRoutes from "./routes/coupon.routes.js"
import paymentRoutes from "./routes/payement.routes.js"
import analyticsRoutes from "./routes/analytics.routes.js"
import { connectDb } from "./lib/db.js"
import cookieParser from "cookie-parser"
configDotenv()

const app= express()
const port = process.env.PORT || 5000

app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/coupons", couponRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/payments", paymentRoutes)
connectDb()

app.listen(port, ()=>[
    console.log("Server is running on port", port)
])