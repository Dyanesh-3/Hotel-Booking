import mongoose from 'mongoose';
import 'dotenv/config';
import Hotel from './models/Hotel.js';
import Room from './models/Room.js';

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI.includes('/hotel-booking') ? process.env.MONGODB_URI : `${process.env.MONGODB_URI}/hotel-booking`);
        
        const ownerId = "test_owner_pagi";
        const newHotel = await Hotel.create({
            name: "Pagination Hotel", status: "approved", isActive: true, city: "TestCity", address: "123", owner: ownerId, contact: "123", state: "NY"
        });

        await Room.create([
            { hotel: newHotel._id, roomType: "Room A", pricePerNight: 100, isAvailable: true, images: [] },
            { hotel: newHotel._id, roomType: "Room B", pricePerNight: 200, isAvailable: true, images: [] },
            { hotel: newHotel._id, roomType: "Room C", pricePerNight: 300, isAvailable: true, images: [] }
        ]);

        console.log("Testing page=1&limit=1");
        let res = await fetch('http://localhost:3000/api/room?page=1&limit=1');
        let data = await res.json();
        console.log("Page 1 Metadata:", data.pagination);
        console.log("Page 1 Room Type:", data.rooms[0]?.roomType);
        
        console.log("\nTesting page=2&limit=1");
        res = await fetch('http://localhost:3000/api/room?page=2&limit=1');
        data = await res.json();
        console.log("Page 2 Metadata:", data.pagination);
        console.log("Page 2 Room Type:", data.rooms[0]?.roomType);
        process.exit(0);
    } catch(e) {
        console.error(e);
    }
}
run();
