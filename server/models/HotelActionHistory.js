import mongoose from "mongoose";

const hotelActionHistorySchema = new mongoose.Schema({
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
    user: { type: String, ref: "User", required: true },
    action: { 
        type: String, 
        enum: ["created", "approved", "rejected", "suspended", "reactivated", "resubmitted", "updated"],
        required: true 
    },
    reason: { type: String, default: "" }
}, { timestamps: true });

const HotelActionHistory = mongoose.model("HotelActionHistory", hotelActionHistorySchema);

export default HotelActionHistory;
