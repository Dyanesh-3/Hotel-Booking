import Hotel from "../models/Hotel.js";
import User from "../models/User.js";
import HotelActionHistory from "../models/HotelActionHistory.js";

export const registerHotel = async(req,res)=>{
     try{
        const {name, address, contact, city} = req.body;
        const owner = req.user._id;

        const hotel = await Hotel.findOne({owner});
        if(hotel){
            return res.json({ success: false, message: "Hotel Already Registered"});
        }
        const newHotel = await Hotel.create({
            name, 
            address, 
            contact, 
            city, 
            owner,
            status: "approved",
            isActive: true
        });
        await User.findByIdAndUpdate(owner, {role: "hotelOwner"});

        if (HotelActionHistory) {
            await HotelActionHistory.create({
                hotel: newHotel._id,
                user: owner,
                action: 'created',
                reason: 'Hotel registration'
            });
        }

        res.json({success: true, message: "Hotel Registered Successfully"});
     } catch(error){
        res.json({success: false, message: error.message});
     }
};

export const getOwnerHotel = async (req, res) => {
    try {
        const owner = req.user._id;
        const hotel = await Hotel.findOne({ owner });
        if (!hotel) {
            return res.json({ success: false, message: "No hotel found" });
        }
        res.json({ success: true, hotel });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const updateHotel = async (req, res) => {
    try {
        const owner = req.user._id;
        const { id } = req.params;
        const { name, address, contact, city } = req.body;

        const hotel = await Hotel.findOne({ _id: id, owner });
        if (!hotel) {
            return res.json({ success: false, message: "Hotel not found or unauthorized" });
        }

        hotel.name = name || hotel.name;
        hotel.address = address || hotel.address;
        hotel.contact = contact || hotel.contact;
        hotel.city = city || hotel.city;

        await hotel.save();

        if (HotelActionHistory) {
            await HotelActionHistory.create({
                hotel: hotel._id,
                user: owner,
                action: 'updated',
                reason: 'Owner updated hotel details'
            });
        }

        res.json({ success: true, message: "Hotel updated successfully", hotel });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const resubmitHotel = async (req, res) => {
    try {
        const owner = req.user._id;
        const { id } = req.params;

        const hotel = await Hotel.findOne({ _id: id, owner });
        if (!hotel) {
            return res.json({ success: false, message: "Hotel not found or unauthorized" });
        }

        if (hotel.status !== "rejected") {
            return res.json({ success: false, message: "Only rejected hotels can be resubmitted" });
        }

        hotel.status = "approved";
        hotel.isActive = true;
        hotel.rejectionReason = "";

        await hotel.save();

        if (HotelActionHistory) {
            await HotelActionHistory.create({
                hotel: hotel._id,
                user: owner,
                action: 'resubmitted',
                reason: 'Owner resubmitted after rejection'
            });
        }

        res.json({ success: true, message: "Hotel resubmitted successfully for approval" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


// API to get distinct destination cities from approved & active hotels
export const getDestinations = async (req, res) => {
    try {
        const cities = await Hotel.find({ status: "approved", isActive: true }).distinct("city");

        const validCities = cities
            .filter(city => typeof city === 'string' && city.trim().length > 0)
            .map(city => city.trim())
            .filter((city, index, self) => 
                index === self.findIndex(c => c.toLowerCase() === city.toLowerCase())
            )
            .sort((a, b) => a.localeCompare(b));

        res.json({ success: true, destinations: validCities });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
