import { configDotenv } from "dotenv";
import Stripe from "stripe";
configDotenv()
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)