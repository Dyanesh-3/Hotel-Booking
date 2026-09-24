import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    user: {type: String, ref: "User", required: true},
    room: {type: String, ref: "Room", required: true},
    hotel: {type: String, ref: "Hotel", required: true},
    checkInDate: {type: Date, required: true},
    checkOutDate: {type: Date, required: true},
    totalPrice: {type: Number, required: true},
    guests: {type: Number, required: true},
    status:{
        type: String,
        enum: ["pending", "confirmed", "cancelled", "completed"],
        default: "pending",
    },
    paymentMethod:{
        type: String,
        required: true,
        default: "Pay At Hotel",
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
    }
    
},{timestamps: true}
);

bookingSchema.index({ room: 1, checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ hotel: 1, createdAt: -1 });
bookingSchema.index({ paymentStatus: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;