import express from "express"
import { signup, login, logout, RefreshToken } from "../controllers/auth.controller.js"

const router = express.Router()

router.post("/signup",signup)
router.post("/login",login)
router.post("/logout",logout)
router.post("/refreshtoken",RefreshToken)

// To do :Get Profile

export default router