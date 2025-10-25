import express from "express"
import { protectRoute } from "../middleware/authMiddleware"
import { getCoupon, validateCoupon } from "../controllers/coupon.controller.js"


const router = express.Router()

router.get("/", protectRoute, getCoupon)
router.get("/validate", protectRoute, validateCoupon)

// To do :Get Profile

export default router