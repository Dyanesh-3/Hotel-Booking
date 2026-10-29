import mongoose from "mongoose";

let cachedPromise = null;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return;
    }

    if (mongoose.connection.readyState === 2 && cachedPromise) {
        return cachedPromise;
    }

    if (!cachedPromise) {
        const uri = process.env.MONGODB_URI.includes('/hotel-booking')
            ? process.env.MONGODB_URI
            : `${process.env.MONGODB_URI}/hotel-booking`;

        cachedPromise = mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
        }).then((db) => {
            console.log("Database Connected");
            return db;
        }).catch((error) => {
            cachedPromise = null;
            console.error("MongoDB connection error:", error.message);
            throw error;
        });
    }

    return cachedPromise;
};

export default connectDB;
