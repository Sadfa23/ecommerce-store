import express from "express"
import { protectRoute } from "../middleware/authMiddleware.js"
import { addToCart, getCartProducts, removeAllFromCart, updateQuantity } from "../controllers/cart.controller.js"

const router = express.Router()

router.post("/", protectRoute,addToCart)
router.delete("/", protectRoute,removeAllFromCart)
router.put("/:id", protectRoute,updateQuantity)
router.get("/", protectRoute,getCartProducts)

export default router