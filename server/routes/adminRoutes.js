import express from 'express';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import {
    getAllHotels,
    getPendingHotels,
    approveHotel,
    rejectHotel,
    suspendHotel,
    reactivateHotel,
    deleteHotel,
    getUsers,
    suspendUser,
    reactivateUser,
    getBookings,
    getDashboardStats,
    getHotelActionHistory
} from '../controllers/adminController.js';

const adminRouter = express.Router();

// Apply middleware to all admin routes
adminRouter.use(protect);
adminRouter.use(requireRole("admin"));

// Dashboard
adminRouter.get('/dashboard', getDashboardStats);

// Hotel Management
adminRouter.get('/hotels', getAllHotels);
adminRouter.get('/hotels/pending', getPendingHotels);
adminRouter.put('/hotels/:id/approve', approveHotel);
adminRouter.put('/hotels/:id/reject', rejectHotel);
adminRouter.put('/hotels/:id/suspend', suspendHotel);
adminRouter.put('/hotels/:id/reactivate', reactivateHotel);
adminRouter.delete('/hotels/:id', deleteHotel);
adminRouter.get('/hotels/:id/history', getHotelActionHistory);

// User Management
adminRouter.get('/users', getUsers);
adminRouter.put('/users/:id/suspend', suspendUser);
adminRouter.put('/users/:id/reactivate', reactivateUser);

// Bookings
adminRouter.get('/bookings', getBookings);

export default adminRouter;
