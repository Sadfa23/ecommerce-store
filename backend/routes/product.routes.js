import express from "express"
import { adminRoute, protectRoute } from "../middleware/authMiddleware.js"
import { 
    getAllProducts, 
    getFeaturedProducts, 
    createProduct, 
    deleteProduct, 
    getRecommendedProducts, 
    getProductsByCategory,
    toggleFeaturedProduct } from "../controllers/product.controller.js"


const router = express.Router()

router.get("/", protectRoute, adminRoute,getAllProducts)
router.post("/", protectRoute, adminRoute,createProduct)
router.patch("/:id", protectRoute, adminRoute,toggleFeaturedProduct)
router.delete("/:id", protectRoute, adminRoute,deleteProduct)
router.get("/featured",getFeaturedProducts)
router.get("/category/:category",getProductsByCategory)
router.get("/recommendations",getRecommendedProducts)

export default router