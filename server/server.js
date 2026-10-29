import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import clerkWebhooks from "./controllers/clerkWebhooks.js";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

connectDB();
connectCloudinary();

const app = express();

app.set('trust proxy', 1);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://hotel-booking-azure-gamma.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
].filter(Boolean).map(url => url.replace(/\/+$/, ''));

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/+$/, '');
    const isAllowed = allowedOrigins.includes(cleanOrigin) ||
                      cleanOrigin.endsWith('.vercel.app');

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// API to listen to stripe webhooks
app.post('/api/stripe', express.raw({ type: "application/json" }), stripeWebhooks);

// Normal JSON middleware
app.use(express.json());
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per windowMs
    message: { success: false, message: "Too many requests from this IP, please try again later." }
});
app.use('/api', limiter);

app.use(clerkMiddleware());

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
app.use("/api/users", clerkWebhooks);

app.get("/", (req, res) => { res.send("API is working"); });
app.get("/api/health", (req, res) => { res.json({ status: "ok" }); });
app.use('/api/user', userRouter);
app.use('/api/hotels', hotelRouter);
app.use('/api/room', roomRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/admin', adminRouter);

// Global Error Handler for Production
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'Internal Server Error' 
        : err.message;
    res.status(statusCode).json({ success: false, message });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
