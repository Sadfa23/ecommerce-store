import jwt from "jsonwebtoken"
import User from "../models/user.model.js";
import { redis } from "../lib/redis.js";
import { configDotenv } from "dotenv";
configDotenv()

const generateTokens = (userId)=>{
    const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn:"15m"
    })

    const refreshToken = jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn:"7d"
    })

    return {accessToken, refreshToken}
}

const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh_token:${userId}`, refreshToken, "EX",7*24*60*60)
}

const setCookies = (res, accessToken, refreshToken) =>{
    res.cookie("accessToken", accessToken, {
        httpOnly:true,
        secure:process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15*60*1000
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly:true,
        secure:process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7*24*60*60*1000
    })
}
export const signup = async (req, res) => {
    try {
        const {name, email, password, role} = req.body;
        const userExists = await User.findOne({email})
        if (userExists) {
            res.status(400).json({message: "User already exists"})
        }
        const user = await User.create({name, email, password, role})

        // authenticate
        const {accessToken, refreshToken} = generateTokens(user._id)
        await storeRefreshToken(user._id, refreshToken)

        setCookies(res, accessToken, refreshToken)

        res.status(201).json({
            user: {
                _id:user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }, 
            message:"User created successfuully"
        })
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
    
}

export const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email})
        if (user && (await user.comparePassword(password))) {
            const {accessToken, refreshToken} = generateTokens(user._id)
            await storeRefreshToken(user._id, refreshToken)
            setCookies(res, accessToken, refreshToken)

            return res.json({
                _id:user._id,
                name: user.name,
                email:user.email,
                role: user.role
            })
        } else {
            return res.status(400).json({message:"invalid credentiials"})
        }
        
    } catch (error) {
        return res.status(500).json({message:"Internal server error"})
    }
}

export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
            await redis.del(`refresh_token:${decoded.userId}`)
            res.clearCookie("accesstoken");
            res.clearCookie("refreshToken")
        }
        return res.status(200).json({message:"Logged out successfully"})
    } catch (error) {
        console.log("Error in logout controller",error)
        return res.status(500).json({message:" Server error", error:error.message})
    }
}

export const RefreshToken = async (req, res)=>{
    try {
        const refresh_token = req.cookies.refreshToken
        if (!refresh_token) {
            return res.status(401).json({message: "No refresh token provided"})
        }
        const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET)
        const stored_Refresh_Token = await redis.get(`refresh_token:${decoded.userId}`)
        if (stored_Refresh_Token !== refresh_token) {
            return res.status(401).json({message: "Invalid refresh token"})
        }
        const accessToken = jwt.sign({userId: decoded.userId}, process.env.ACCESS_TOKEN_SECRET, {expiresIn:"15"})
        res.cookie("accessToken", accessToken, {
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15*60*1000
        });
        return res.json({message:"token refreshed successfully"})

    } catch (error) {
        return res.status(500).json({message:" Server error", error:error.message}) 
    }
}


export const getProfile = async (req, res) => {
    try {
        res.json(req.user)
    } catch (error) {
        
    }
}