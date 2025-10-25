import express from "express"
import { createCheckoutSession } from "../controllers/paymentController.js"
import Coupon from "../models/coupon.model.js"
import Order from "../models/order.model.js"
const router = express.Router()
router.post("/create-checkout-session", protectRoute, createCheckoutSession )
router.post("/checkout-success", protectRoute, async(req, res) =>{
    try {
        const {sessionId} = req.body;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if(session.payment_status === "paid") {
            await Coupon.findOneAndUpdate({
                code: session.metadata.couponCode, userId: session.metadata.userId
            }, {
                isActive: false
            })
        }
        // create new order
        const products = JSON.parse(session.metadata);
        const newOrder = new Order({
            user: session.metadata.userId,
            quantity: products.map(product =>({
                product: product.id,
                quantity: product.quantity,
                price: product.price,
            })),
            totalAmount : session.amount_total /100,
            stripeSessionId: sessionId
        })

        await newOrder.save()
        res.status(200).json({
            message: "Payemnt successful",
            orderId: newOrder._id
        })
    } catch (error) {
        console.error("Error in checkout-success router:", error);
        res.status(500).json({ error: error.message });
        console.log(error)
    }
} )

export default router