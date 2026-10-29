import Hotel from "../models/Hotel.js";
import { v2 as cloudinary } from "cloudinary";
import Room from "../models/Room.js";

// API to generate signed upload parameters for Cloudinary
export const getUploadSignature = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ owner: req.user._id });
        if (!hotel) {
            return res.status(403).json({ success: false, message: "Only hotel owners with a registered hotel can upload room images." });
        }

        const config = cloudinary.config();
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME || config.cloud_name;
        const apiKey = process.env.CLOUDINARY_API_KEY || config.api_key;
        const apiSecret = process.env.CLOUDINARY_API_SECRET || config.api_secret;

        if (!cloudName || !apiKey || !apiSecret) {
            return res.status(500).json({ success: false, message: "Cloudinary credentials not properly configured on server" });
        }

        const timestamp = Math.round(new Date().getTime() / 1000);
        const folder = "hotel_rooms";

        const signature = cloudinary.utils.api_sign_request(
            { folder, timestamp },
            apiSecret
        );

        res.json({
            success: true,
            signature,
            timestamp,
            folder,
            apiKey,
            cloudName,
        });
    } catch (error) {
        console.error("getUploadSignature error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to create a new room for a hotel
export const createRoom = async (req, res) => {
    try {
        const { roomType, pricePerNight, amenities } = req.body;
        const hotel = await Hotel.findOne({ owner: req.user._id });

        if (!hotel) return res.json({ success: false, message: "No Hotel found" });

        if (!roomType || !pricePerNight) {
            return res.json({ success: false, message: "Room type and price per night are required" });
        }

        let images = [];

        // 1. Direct Cloudinary upload flow (images sent as array of URLs)
        if (req.body.images) {
            const rawImages = typeof req.body.images === 'string'
                ? JSON.parse(req.body.images)
                : req.body.images;

            if (Array.isArray(rawImages)) {
                const cloudName = process.env.CLOUDINARY_CLOUD_NAME || cloudinary.config().cloud_name;
                images = rawImages.filter(url => {
                    if (typeof url !== 'string' || !url.startsWith('https://')) return false;
                    try {
                        const parsed = new URL(url);
                        const isCloudinary = parsed.hostname.includes('cloudinary.com');
                        const matchesCloud = !cloudName || parsed.pathname.includes(cloudName);
                        return isCloudinary && matchesCloud;
                    } catch {
                        return false;
                    }
                });
            }
        }

        // 2. Fallback: multipart files if passed (backwards compatibility)
        if (images.length === 0 && req.files && req.files.length > 0) {
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
                if (cloudErr.http_code === 403 || cloudErr.message?.includes("403")) {
                    return res.json({
                        success: false,
                        message: "Cloudinary 403 Forbidden: Invalid or expired Cloudinary credentials."
                    });
                }
                throw cloudErr;
            }
        }

        if (images.length === 0) {
            return res.json({ success: false, message: "Please provide valid room images" });
        }

        await Room.create({
            hotel: hotel._id,
            roomType,
            pricePerNight: +pricePerNight,
            amenities: typeof amenities === 'string' ? JSON.parse(amenities) : (amenities || []),
            images,
        });

        res.json({ success: true, message: "Room created successfully" });
    } catch (error) {
        console.error("createRoom error:", error);
        res.json({ success: false, message: error.message });
    }
};

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

        if (sort === 'name_asc') {
            rooms.sort((a, b) => a.hotel.name.localeCompare(b.hotel.name));
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
};

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
};

export const toggleRoomAvailability = async (req, res) => {
    try {
        const { roomId } = req.body;
        const owner = req.user._id;

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
};
