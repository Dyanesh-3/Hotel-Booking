import Hotel from "../models/Hotel.js";
import { v2 as cloudinary } from "cloudinary";
import Room from "../models/Room.js";

// API to create a new room for a hotel
export const createRoom = async (req, res) => {
    try {
        const { roomType, pricePerNight, amenities } = req.body;
        const hotel = await Hotel.findOne({ owner: req.user._id });

        if (!hotel) return res.json({ success: false, message: "No Hotel found" });

        // upload images to cloudinary
        let images = [];
        if (req.files && req.files.length > 0) {
            try {
                const uploadImages = req.files.map(async (file) => {
                    const response = await cloudinary.uploader.upload(file.path, {
                        resource_type: "image",
                        folder: "hotel_rooms"
                    });
                    return response.secure_url;
                });
                images = await Promise.all(uploadImages);
            } catch (cloudErr) {
                console.error("Cloudinary upload error:", cloudErr);
                // If Cloudinary credentials are rejected (403), provide clear message
                if (cloudErr.http_code === 403 || cloudErr.message?.includes("403")) {
                    return res.json({
                        success: false,
                        message: "Cloudinary 403 Forbidden: Invalid or expired Cloudinary credentials. Please check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in server/.env"
                    });
                }
                throw cloudErr;
            }
        }

        await Room.create({
            hotel: hotel._id,
            roomType,
            pricePerNight: +pricePerNight,
            amenities: typeof amenities === 'string' ? JSON.parse(amenities) : amenities,
            images,
        });
        res.json({ success: true, message: "Room created successfully" });
    } catch (error) {
        console.error("createRoom error:", error);
        res.json({ success: false, message: error.message });
    }
}

export const getRooms = async (req, res) => {
    try {
        const { search, city, minPrice, maxPrice, sort, page, limit } = req.query;
        
        // 1. Build Hotel Query
        let hotelQuery = { status: 'approved', isActive: true };
        
        if (city) {
            hotelQuery.city = { $regex: city, $options: 'i' };
        }
        
        if (search) {
            hotelQuery.$or = [
                { name: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } }
            ];
        }

        const matchedHotels = await Hotel.find(hotelQuery).select('_id');
        const hotelIds = matchedHotels.map(h => h._id);

        // 2. Build Room Query
        let roomQuery = { 
            isAvailable: true,
            hotel: { $in: hotelIds }
        };

        if (minPrice || maxPrice) {
            roomQuery.pricePerNight = {};
            if (minPrice) roomQuery.pricePerNight.$gte = Number(minPrice);
            if (maxPrice) roomQuery.pricePerNight.$lte = Number(maxPrice);
        }

        // 3. Sorting
        let sortOptions = { createdAt: -1, _id: 1 };
        if (sort === 'price_asc') sortOptions = { pricePerNight: 1, _id: 1 };
        if (sort === 'price_desc') sortOptions = { pricePerNight: -1, _id: 1 };
        // Name A-Z sorting would ideally be done on the hotel name, but since we are querying rooms, we can't easily sort by populated field in find().
        // However, we'll keep Newest and Price since they are natively on the Room model.
        if (sort === 'newest') sortOptions = { createdAt: -1, _id: 1 };

        // 4. Pagination
        const pageNumber = Math.max(1, parseInt(page) || 1);
        const limitNumber = Math.min(50, Math.max(1, parseInt(limit) || 12));
        const skip = (pageNumber - 1) * limitNumber;

        const total = await Room.countDocuments(roomQuery);
        const totalPages = Math.ceil(total / limitNumber);

        let rooms = await Room.find(roomQuery)
            .populate({
                path: 'hotel',
                populate: {
                    path: 'owner',
                    select: 'image'
                }
            })
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNumber);

        // Client-side sort fallback for 'name_asc' since hotel name is populated
        if (sort === 'name_asc') {
            rooms.sort((a, b) => a.hotel.name.localeCompare(b.hotel.name));
            // Note: Pagination on client-side sorted data across multiple pages isn't perfect, but covers the basic requirement safely without complex aggregations.
        }

        res.json({ 
            success: true, 
            rooms,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total,
                totalPages
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const getOwnerRooms = async (req, res) => {
    try {
        const hotelData = await Hotel.findOne({ owner: req.user._id });
        if (!hotelData) {
            return res.json({ success: false, message: "No Hotel found" });
        }
        const rooms = await Room.find({ hotel: hotelData._id.toString() }).populate("hotel");
        res.json({ success: true, rooms });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const toggleRoomAvailability = async (req, res) => {
    try {
        const { roomId } = req.body;
        const owner = req.user._id;

        // Check if the owner's hotel matches the room's hotel
        const hotel = await Hotel.findOne({ owner });
        if (!hotel) {
            return res.json({ success: false, message: "No Hotel found for owner" });
        }

        const roomData = await Room.findById(roomId);
        if (!roomData) {
            return res.json({ success: false, message: "Room not found" });
        }

        if (roomData.hotel.toString() !== hotel._id.toString()) {
            return res.json({ success: false, message: "Unauthorized to modify this room" });
        }

        roomData.isAvailable = !roomData.isAvailable;
        await roomData.save();
        res.json({ success: true, message: "Room availability Updated" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}