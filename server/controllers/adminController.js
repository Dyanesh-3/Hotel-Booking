import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import HotelActionHistory from "../models/HotelActionHistory.js";

export const getAllHotels = async (req, res) => {
    try {
        const { search, status, city } = req.query;
        let query = {};
        
        if (status) query.status = status;
        if (city) query.city = { $regex: city, $options: 'i' };
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } }
            ];
        }

        const hotels = await Hotel.find(query)
            .populate('owner', 'username email image')
            .sort({ createdAt: -1 });

        // If searching by owner name (since it's populated, we must filter post-query or use aggregation, post-query is safer for small datasets)
        let filteredHotels = hotels;
        if (search) {
            filteredHotels = hotels.filter(h => 
                (h.owner && h.owner.username.toLowerCase().includes(search.toLowerCase())) || 
                h.name.toLowerCase().includes(search.toLowerCase()) || 
                h.city.toLowerCase().includes(search.toLowerCase()) || 
                h.address.toLowerCase().includes(search.toLowerCase())
            );
        }

        res.json({ success: true, hotels: filteredHotels });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// GET /api/admin/hotels/pending
export const getPendingHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find({ status: "pending" })
            .populate('owner', 'username email image')
            .sort({ createdAt: -1 });
        res.json({ success: true, hotels });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// PUT /api/admin/hotels/:id/approve
export const approveHotel = async (req, res) => {
    try {
        const hotelId = req.params.id;
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) return res.json({ success: false, message: "Hotel not found" });

        if (hotel.status !== 'pending' && hotel.status !== 'rejected') {
            return res.json({ success: false, message: "Only pending or rejected hotels can be approved" });
        }

        hotel.status = "approved";
        hotel.isActive = true;
        hotel.rejectionReason = "";
        hotel.suspensionReason = "";
        await hotel.save();

        if (HotelActionHistory) {
            await HotelActionHistory.create({
                hotel: hotel._id,
                user: req.user._id,
                action: 'approved',
                reason: 'Admin approved hotel'
            });
        }

        res.json({ success: true, message: "Hotel approved successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// PUT /api/admin/hotels/:id/reject
export const rejectHotel = async (req, res) => {
    try {
        const hotelId = req.params.id;
        const { reason } = req.body;
        
        if (!reason) {
            return res.json({ success: false, message: "Rejection reason is required" });
        }

        const hotel = await Hotel.findById(hotelId);
        if (!hotel) return res.json({ success: false, message: "Hotel not found" });
        
        if (hotel.status !== 'pending') {
            return res.json({ success: false, message: "Only pending hotels can be rejected. Use suspend for approved hotels." });
        }

        hotel.status = "rejected";
        hotel.isActive = false;
        hotel.rejectionReason = reason;
        await hotel.save();

        if (HotelActionHistory) {
            await HotelActionHistory.create({
                hotel: hotel._id,
                user: req.user._id,
                action: 'rejected',
                reason
            });
        }

        res.json({ success: true, message: "Hotel rejected successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// PUT /api/admin/hotels/:id/suspend
export const suspendHotel = async (req, res) => {
    try {
        const hotelId = req.params.id;
        const { reason } = req.body;

        const hotel = await Hotel.findById(hotelId);
        if (!hotel) return res.json({ success: false, message: "Hotel not found" });

        hotel.status = "suspended";
        hotel.isActive = false;
        if (reason) hotel.suspensionReason = reason;
        await hotel.save();

        if (HotelActionHistory) {
            await HotelActionHistory.create({
                hotel: hotel._id,
                user: req.user._id,
                action: 'suspended',
                reason: reason || 'Admin suspended hotel'
            });
        }

        res.json({ success: true, message: "Hotel suspended successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// PUT /api/admin/hotels/:id/reactivate
export const reactivateHotel = async (req, res) => {
    try {
        const hotelId = req.params.id;
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) return res.json({ success: false, message: "Hotel not found" });

        if (hotel.status !== 'suspended' && hotel.status !== 'rejected') {
            return res.json({ success: false, message: "Only suspended or rejected hotels can be reactivated/approved" });
        }

        hotel.status = "approved";
        hotel.isActive = true;
        hotel.suspensionReason = "";
        await hotel.save();

        if (HotelActionHistory) {
            await HotelActionHistory.create({
                hotel: hotel._id,
                user: req.user._id,
                action: 'reactivated',
                reason: 'Admin reactivated hotel'
            });
        }

        res.json({ success: true, message: "Hotel reactivated successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// DELETE /api/admin/hotels/:id
export const deleteHotel = async (req, res) => {
    try {
        const hotelId = req.params.id;
        
        // We need to check if it has bookings. If yes, we shouldn't delete it.
        const bookingsCount = await Booking.countDocuments({ hotel: hotelId });
        if (bookingsCount > 0) {
            return res.json({ 
                success: false, 
                message: "Cannot delete hotel because it has existing bookings. Please suspend it instead." 
            });
        }

        // It is safe to delete
        await Room.deleteMany({ hotel: hotelId });
        await Hotel.findByIdAndDelete(hotelId);

        res.json({ success: true, message: "Hotel deleted successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// GET /api/admin/users
export const getUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// PUT /api/admin/users/:id/suspend
export const suspendUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) return res.json({ success: false, message: "User not found" });
        if (user.role === 'admin') return res.json({ success: false, message: "Cannot suspend an admin" });

        user.status = "suspended";
        await user.save();
        res.json({ success: true, message: "User suspended successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// PUT /api/admin/users/:id/reactivate
export const reactivateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) return res.json({ success: false, message: "User not found" });

        user.status = "active";
        await user.save();
        res.json({ success: true, message: "User reactivated successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// GET /api/admin/bookings
export const getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('hotel', 'name')
            .populate('room', 'roomType pricePerNight')
            .populate('user', 'username email')
            .sort({ createdAt: -1 });
        res.json({ success: true, bookings });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// GET /api/admin/dashboard
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalHotelOwners = await User.countDocuments({ role: 'hotelOwner' });
        const totalHotels = await Hotel.countDocuments();
        const pendingHotels = await Hotel.countDocuments({ status: 'pending' });
        const approvedHotels = await Hotel.countDocuments({ status: 'approved' });
        const suspendedHotels = await Hotel.countDocuments({ status: 'suspended' });
        
        const totalBookings = await Booking.countDocuments();
        const bookings = await Booking.find();
        const totalRevenue = bookings.reduce((acc, curr) => acc + curr.totalPrice, 0);

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalHotelOwners,
                totalHotels,
                pendingHotels,
                approvedHotels,
                suspendedHotels,
                totalBookings,
                totalRevenue
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// GET /api/admin/hotels/:id/history
export const getHotelActionHistory = async (req, res) => {
    try {
        const history = await HotelActionHistory.find({ hotel: req.params.id })
            .populate('user', 'username email role')
            .sort({ createdAt: -1 });
        res.json({ success: true, history });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
