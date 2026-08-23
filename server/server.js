import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import clerkWebhooks from "./controllers/clerkWebhooks.js";
import userRoutes from "./routes/userRoutes.js";

connectDB();

console.log("ENV CHECK - CLERK_SECRET_KEY present:", !!process.env.CLERK_SECRET_KEY);
console.log("ENV CHECK - MONGODB_URI present:", !!process.env.MONGODB_URI);

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL }));

// IMPORTANT:
// Webhook route must come BEFORE express.json()
app.post(
    "/api/users",
    express.raw({ type: "application/json" }),
    clerkWebhooks
);

// Normal JSON middleware
app.use(express.json());



// User routes
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
    res.send("API is working");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});