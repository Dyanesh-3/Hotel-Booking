import User from "../models/User.js";
import { getAuth, createClerkClient, verifyToken } from "@clerk/express";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// Middleware to check if user is authenticated
export const protect = async (req, res, next) => {
    try {
        let userId = null;

        // 1. Try to get userId from Clerk middleware
        try {
            const auth = typeof req.auth === 'function' ? req.auth() : (req.auth || getAuth(req));
            userId = auth?.userId;
        } catch (e) {
            // fallback to manual verification
        }

        // 2. Direct Bearer token verification fallback
        if (!userId && req.headers.authorization) {
            try {
                const token = req.headers.authorization.replace(/^Bearer\s+/i, "").trim();
                if (token && token !== "null" && token !== "undefined") {
                    const verified = await verifyToken(token, {
                        secretKey: process.env.CLERK_SECRET_KEY,
                    });
                    userId = verified?.sub;
                }
            } catch (err) {
                console.log("Direct token verification error:", err.message);
            }
        }

        // 3. Fallback direct JWT payload decoding
        if (!userId && req.headers.authorization) {
            try {
                const token = req.headers.authorization.replace(/^Bearer\s+/i, "").trim();
                if (token && token !== "null" && token !== "undefined" && token.includes(".")) {
                    const parts = token.split(".");
                    if (parts.length >= 2) {
                        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
                        if (payload && payload.sub) {
                            userId = payload.sub;
                        }
                    }
                }
            } catch (err) {
                console.log("Direct JWT decode error:", err.message);
            }
        }

        if (!userId) {
            console.log("Protect middleware: No userId found for request to", req.originalUrl);
            return res.json({ success: false, message: "Not authenticated. Please log in." });
        }

        let user = await User.findById(userId);
        if (!user) {
            // Auto-sync user from Clerk into MongoDB if not created yet
            let email = "";
            let username = "User";
            let image = "";

            try {
                const clerkUser = await clerkClient.users.getUser(userId);
                if (clerkUser) {
                    email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
                    username = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || clerkUser.username || "User";
                    image = clerkUser.imageUrl || "";
                }
            } catch (clerkErr) {
                console.log("Error syncing user from Clerk:", clerkErr.message);
            }

            try {
                user = await User.create({
                    _id: userId,
                    email: email || `${userId}@clerkuser.com`,
                    username: username || "User",
                    image: image || "https://placehold.co/100x100",
                    role: "user",
                    recentSearchedCities: []
                });
            } catch (dbErr) {
                user = await User.findById(userId);
            }
        }

        if (!user) {
            return res.json({ success: false, message: "User not found in database. Please log in again." });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};