import User from "../models/User.js";
import { verifyToken } from "@clerk/express";

// GET /api/users/me
// Returns the logged-in user's data from MongoDB using their Clerk ID
export const getMe = async (req, res) => {
    try {
        console.log("=== /api/users/me called ===");

        // Extract Bearer token from Authorization header
        const token = req.headers.authorization?.split(" ")[1];

        console.log("Token present:", !!token);

        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        // Manually verify the Clerk session token
        let clerkUserId;
        try {
            const secretKey = process.env.CLERK_SECRET_KEY?.trim();
            console.log("Secret Key length:", secretKey?.length);
            console.log("Secret Key starts with:", secretKey?.substring(0, 15));
            console.log("Secret Key ends with:", secretKey?.substring(secretKey?.length - 5));

            const payload = await verifyToken(token, {
                secretKey: secretKey,
            });
            clerkUserId = payload.sub;
            console.log("Token verified, userId:", clerkUserId);
        } catch (verifyError) {
            console.log("Token verification failed:", verifyError.message);
            return res.status(401).json({ success: false, message: "Invalid token" });
        }

        if (!clerkUserId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const user = await User.findById(clerkUserId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found in database" });
        }

        res.status(200).json({ success: true, user });

    } catch (error) {
        console.error("getMe error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
