import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import clerkWebhooks from "./controllers/clerkWebhooks.js";
import userRouter from "./routes/userRoutes.js"
import hotelRouter from "./routes/hotelRoutes.js";
import connectCloudinary from "./configs/cloudinary.js"
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";

connectDB()
connectCloudinary();

const app = express()
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// API to listen to stripe webhooks
app.post('/api/stripe', express.raw({ type: "application/json" }), stripeWebhooks);

// Normal JSON middleware
app.use(express.json())
app.use(clerkMiddleware())

// Ensure DB connected before processing API requests (crucial for Vercel serverless)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: "Database connection failed" });
    }
});

// User routes
app.use("/api/users", clerkWebhooks)

app.get("/", (req, res) => { res.send("API is working"); })
app.use('/api/user', userRouter)
app.use('/api/hotels', hotelRouter)
app.use('/api/room', roomRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/admin', adminRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));