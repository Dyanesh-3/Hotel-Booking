import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import clerkWebhooks from "./controllers/clerkWebhooks.js";
import userRouter from "./routes/userRoutes.js"
import hotelRouter from "./routes/hotelRoutes.js";
import connectCloudinary from "./configs/cloudinary.js"
import roomRouter from "./routes/roomRoutes.js"
import bookingRouter from "./routes/bookingRoutes.js";
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";

connectDB()
connectCloudinary();

const app = express()
app.use(cors())

// API to listen to stripe webhooks
app.post('/api/stripe', express.raw({type: "application/json"}), stripeWebhooks);

// Normal JSON middleware
app.use(express.json())
app.use(clerkMiddleware())

// User routes
app.use("/api/users", clerkWebhooks)

app.get("/", (req, res) => {res.send("API is working");})
app.use('/api/user', userRouter)
app.use('/api/hotels', hotelRouter)
app.use('/api/room', roomRouter)
app.use('/api/bookings', bookingRouter)
app.use('/api/booking', bookingRouter)


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));