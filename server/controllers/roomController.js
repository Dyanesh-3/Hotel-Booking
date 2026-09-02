import Hotel from "../models/hotel.js";
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
        const rooms = await Room.find({ isAvailable: true }).populate({
            path: 'hotel',
            populate: {
                path: 'owner',
                select: 'image'
            }
        }).sort({ createdAt: -1 });
        res.json({ success: true, rooms });
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
        const roomData = await Room.findById(roomId);
        if (!roomData) {
            return res.json({ success: false, message: "Room not found" });
        }
        roomData.isAvailable = !roomData.isAvailable;
        await roomData.save();
        res.json({ success: true, message: "Room availability Updated" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}