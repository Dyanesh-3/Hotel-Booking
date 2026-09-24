import mongoose from "mongoose";
import "dotenv/config";
import User from "../models/User.js";
import connectDB from "../configs/db.js";

const makeAdmin = async () => {
    try {
        const userId = process.argv[2];
        if (!userId) {
            console.log("Usage: node makeAdmin.js <clerk_user_id>");
            process.exit(1);
        }

        await connectDB();
        
        const user = await User.findById(userId);
        if (!user) {
            console.log("User not found in MongoDB. Ensure you have logged in at least once.");
            process.exit(1);
        }

        user.role = "admin";
        await user.save();

        console.log(`Success! User ${user.email} (${user._id}) is now an admin.`);
        process.exit(0);
    } catch (error) {
        console.error("Error making user admin:", error.message);
        process.exit(1);
    }
};

makeAdmin();
