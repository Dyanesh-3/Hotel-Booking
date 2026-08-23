import User from "../models/User.js";

// GET /api/users/me
// Returns the logged-in user's data from MongoDB using their Clerk ID
export const getMe = async (req, res) => {
    try {
        console.log("=== /api/users/me called ===");
        console.log("req.auth:", JSON.stringify(req.auth));
        console.log("Authorization header:", req.headers.authorization?.substring(0, 30));

        const clerkUserId = req.auth?.userId;

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
