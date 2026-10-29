import React, { useEffect, useMemo } from 'react'
import HotelCard from './HotelCard'
import Title from './Title'
import { useAppContext } from '../context/AppContext'

const FeaturedDestination = () => {

  const { rooms, fetchRooms, navigate } = useAppContext();

  useEffect(() => {
    if (fetchRooms) {
      fetchRooms();
    }
  }, []);

  // Filter and deduplicate to show distinct featured hotels that have images
  const featuredRooms = useMemo(() => {
    if (!rooms || rooms.length === 0) return [];

    // Filter out invalid or orphan rooms
    const validRooms = rooms.filter(room => room && room.hotel && room.hotel.name);

    // Group rooms by hotel ID
    const roomsByHotel = new Map();
    for (const room of validRooms) {
      const hotelId = room.hotel._id ? room.hotel._id.toString() : room.hotel.toString();
      if (!hotelId) continue;
      if (!roomsByHotel.has(hotelId)) {
        roomsByHotel.set(hotelId, []);
      }
      roomsByHotel.get(hotelId).push(room);
    }

    // For each distinct hotel, pick its best representative room:
    // 1. Prefer a room with valid Cloudinary images
    // 2. If multiple rooms have images (or neither has), pick the newest
    const distinctHotels = [];
    for (const [hotelId, hotelRooms] of roomsByHotel.entries()) {
      const sortedRooms = [...hotelRooms].sort((a, b) => {
        const aHasImg = a.images && a.images.length > 0 && a.images[0] ? 1 : 0;
        const bHasImg = b.images && b.images.length > 0 && b.images[0] ? 1 : 0;
        if (bHasImg !== aHasImg) return bHasImg - aHasImg;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      if (sortedRooms[0]) {
        distinctHotels.push(sortedRooms[0]);
      }
    }

    // Sort distinct hotels: hotels with images first, then by newest
    distinctHotels.sort((a, b) => {
      const aHasImg = a.images && a.images.length > 0 && a.images[0] ? 1 : 0;
      const bHasImg = b.images && b.images.length > 0 && b.images[0] ? 1 : 0;
      if (bHasImg !== aHasImg) return bHasImg - aHasImg;
      const aDate = new Date(a.hotel?.createdAt || a.createdAt);
      const bDate = new Date(b.hotel?.createdAt || b.createdAt);
      return bDate - aDate;
    });

    // Apply the 4-card limit only AFTER identifying eligible, distinct hotels
    return distinctHotels.slice(0, 4);
  }, [rooms]);

  return featuredRooms.length > 0 && (
    <div className='flex flex-col items-center px-6 md:px-16 lg:px-24 py-20'>
      <Title title='Featured Hotels' subTitle='Discover our handpicked selection of exceptional properties around the world, offering unparalleled luxury and unforgettable experiences.'/>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 w-full'>
        {featuredRooms.map((room, index) => (
          <HotelCard key={room._id} room={room} index={index}/>
        ))}
      </div>

      <button onClick={() => { navigate('/rooms'); window.scrollTo(0,0); }} className='mt-10 px-6 py-2 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50 transition-all cursor-pointer'>
        View All Destinations
      </button>
    </div>
  )
}

export default FeaturedDestination
