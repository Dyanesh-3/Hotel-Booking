import mongoose from "mongoose";
import "dotenv/config";
import Hotel from "../models/Hotel.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import connectDB from "../configs/db.js";
import { getUsers, suspendUser, reactivateUser, getBookings, getDashboardStats } from "../controllers/adminController.js";

const runTests = async () => {
    try {
        await connectDB();

        // Utility to mock req and res
        const mockRes = () => {
            const res = {};
            res.json = (data) => res.data = data;
            res.status = (code) => { res.statusCode = code; return res; };
            return res;
        };

        // TEST 1: GET /api/admin/dashboard
        let req = {};
        let res = mockRes();
        await getDashboardStats(req, res);
        console.log("Dashboard Stats:", res.data.success ? "SUCCESS" : "FAIL", "| Users:", res.data.stats?.totalUsers, "| Hotels:", res.data.stats?.totalHotels);

        // TEST 2: GET /api/admin/users
        req = {};
        res = mockRes();
        await getUsers(req, res);
        console.log("Get Users:", res.data.success ? "SUCCESS" : "FAIL", "| Found:", res.data.users?.length);

        // Optional: TEST SUSPEND/REACTIVATE (Need a dummy user first)
        let dummyUser = await User.create({
            _id: "dummy_admin_test_user_123",
            username: "DummyUser",
            email: "dummy@clerkuser.com",
            image: "dummy.jpg",
            role: "user",
            status: "active",
            clerkId: "clerk_dummy"
        });

        req = { params: { id: dummyUser._id } };
        res = mockRes();
        await suspendUser(req, res);
        dummyUser = await User.findById(dummyUser._id);
        console.log("Suspend User:", res.data.success ? "SUCCESS" : "FAIL", "| Status:", dummyUser.status);

        req = { params: { id: dummyUser._id } };
        res = mockRes();
        await reactivateUser(req, res);
        dummyUser = await User.findById(dummyUser._id);
        console.log("Reactivate User:", res.data.success ? "SUCCESS" : "FAIL", "| Status:", dummyUser.status);

        await User.findByIdAndDelete(dummyUser._id);

        // TEST 3: GET /api/admin/bookings
        req = {};
        res = mockRes();
        await getBookings(req, res);
        console.log("Get Bookings:", res.data.success ? "SUCCESS" : "FAIL", "| Found:", res.data.bookings?.length);

        console.log("Phase 4 backend API tests completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Test error:", error);
        process.exit(1);
    }
};

runTests();
