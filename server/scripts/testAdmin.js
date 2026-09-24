import mongoose from "mongoose";
import "dotenv/config";
import Hotel from "../models/Hotel.js";
import User from "../models/User.js";
import connectDB from "../configs/db.js";
import { approveHotel, rejectHotel, suspendHotel, reactivateHotel } from "../controllers/adminController.js";
import { createBooking } from "../controllers/bookingController.js";
import Room from "../models/Room.js";

const runTests = async () => {
    try {
        await connectDB();
        
        // 1. Create a dummy hotel
        let testHotel = await Hotel.create({
            name: "Test Pending Hotel",
            address: "123 Test St",
            contact: "1234567890",
            owner: "dummy_owner_id",
            city: "Test City",
            status: "pending",
            isActive: true
        });

        console.log("TEST 1: Hotel created. Status:", testHotel.status, "| isActive:", testHotel.isActive);

        // Utility to mock req and res
        const mockRes = () => {
            const res = {};
            res.json = (data) => res.data = data;
            res.status = (code) => { res.statusCode = code; return res; };
            return res;
        };

        // TEST 4: Approve Hotel
        let req = { params: { id: testHotel._id } };
        let res = mockRes();
        await approveHotel(req, res);
        
        testHotel = await Hotel.findById(testHotel._id);
        console.log("TEST 4: Approve Hotel -> Result:", res.data.success, "| Status:", testHotel.status, "| isActive:", testHotel.isActive);

        // TEST 6: Reject Hotel
        req = { params: { id: testHotel._id }, body: { reason: "Bad location" } };
        res = mockRes();
        await rejectHotel(req, res);
        
        testHotel = await Hotel.findById(testHotel._id);
        console.log("TEST 6: Reject Hotel -> Result:", res.data.success, "| Status:", testHotel.status, "| isActive:", testHotel.isActive, "| Reason:", testHotel.rejectionReason);

        // TEST 7: Suspend Hotel
        await approveHotel({ params: { id: testHotel._id } }, mockRes()); // Re-approve first to test suspend
        req = { params: { id: testHotel._id }, body: { reason: "Violations" } };
        res = mockRes();
        await suspendHotel(req, res);

        testHotel = await Hotel.findById(testHotel._id);
        console.log("TEST 7: Suspend Hotel -> Result:", res.data.success, "| Status:", testHotel.status, "| isActive:", testHotel.isActive, "| Reason:", testHotel.suspensionReason);

        // TEST 8: Reactivate Hotel
        req = { params: { id: testHotel._id } };
        res = mockRes();
        await reactivateHotel(req, res);

        testHotel = await Hotel.findById(testHotel._id);
        console.log("TEST 8: Reactivate Hotel -> Result:", res.data.success, "| Status:", testHotel.status, "| isActive:", testHotel.isActive);

        // TEST 10: Customer attempts to book a suspended hotel
        await suspendHotel({ params: { id: testHotel._id }, body: {} }, mockRes());
        
        // Mock a room for this hotel
        const testRoom = await Room.create({
            hotel: testHotel._id,
            roomType: "Test Room",
            pricePerNight: 100,
            amenities: ["WiFi"],
            images: [],
            isAvailable: true
        });

        req = { 
            body: { room: testRoom._id, checkInDate: "2026-10-01", checkOutDate: "2026-10-05", guests: 2 },
            user: { _id: "dummy_user_id", email: "test@example.com" }
        };
        res = mockRes();
        await createBooking(req, res);
        
        console.log("TEST 10: Book Suspended Hotel ->", res.statusCode === 403 ? "SUCCESS (403)" : "FAIL", "| Message:", res.data?.message);

        // Cleanup
        await Room.findByIdAndDelete(testRoom._id);
        await Hotel.findByIdAndDelete(testHotel._id);

        console.log("All backend tests completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Test error:", error);
        process.exit(1);
    }
};

runTests();
