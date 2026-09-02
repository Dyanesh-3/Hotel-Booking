import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("Database Connected");
        });

        const uri = process.env.MONGODB_URI.includes('/hotel-booking')
            ? process.env.MONGODB_URI
            : `${process.env.MONGODB_URI}/hotel-booking`;
        await mongoose.connect(uri);
        
    } catch (error) {
        console.log("MongoDB connection error:", error.message);
    }
};

export default connectDB;