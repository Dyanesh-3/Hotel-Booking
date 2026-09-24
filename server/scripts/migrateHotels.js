import mongoose from "mongoose";
import "dotenv/config";
import Hotel from "../models/Hotel.js";
import connectDB from "../configs/db.js";

const migrateHotels = async () => {
    try {
        await connectDB();
        
        // Find hotels that don't have a status or are strictly stuck in some old state
        // By default, Mongoose will apply "pending" to new queries if we save them,
        // but we want existing ones to be 'approved' because they were created before
        // the approval system existed.
        const hotels = await Hotel.find({ 
            $or: [
                { status: { $exists: false } },
                { status: "pending" } // We assume any existing pending hotels before the system was active should be grandfathered in as approved, or we can just update all currently existing ones.
            ]
        });

        console.log(`Found ${hotels.length} hotels to migrate to "approved"`);

        for (const hotel of hotels) {
            hotel.status = "approved";
            hotel.isActive = true;
            await hotel.save();
            console.log(`Migrated hotel: ${hotel.name} (${hotel._id})`);
        }

        console.log("Migration completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Migration error:", error.message);
        process.exit(1);
    }
};

migrateHotels();
