import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
    if (isConnected || mongoose.connection.readyState === 1) {
        return;
    }

    try {
        const uri = process.env.MONGODB_URI.includes('/hotel-booking')
            ? process.env.MONGODB_URI
            : `${process.env.MONGODB_URI}/hotel-booking`;

        const db = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });

        isConnected = db.connections[0].readyState === 1;
        console.log("Database Connected");
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        throw error;
    }
};

export default connectDB;