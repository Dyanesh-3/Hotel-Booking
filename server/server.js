import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import clerkWebhooks from "./controllers/clerkWebhooks.js";

connectDB();

const app = express();

app.use(cors());

// IMPORTANT:
// Webhook route must come BEFORE express.json()
app.post(
    "/api/users",
    express.raw({ type: "application/json" }),
    clerkWebhooks
);

// Normal JSON middleware
app.use(express.json());

// Clerk middleware
app.use(clerkMiddleware());

app.get("/", (req, res) => {
    res.send("API is working");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});