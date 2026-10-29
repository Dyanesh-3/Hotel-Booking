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

    // Prioritize rooms with valid images
    const sorted = [...validRooms].sort((a, b) => {
      const aHasImg = a.images && a.images.length > 0 && a.images[0] ? 1 : 0;
      const bHasImg = b.images && b.images.length > 0 && b.images[0] ? 1 : 0;
      return bHasImg - aHasImg;
    });

    // Ensure distinct hotels
    const seenHotels = new Set();
    const distinct = [];

    for (const room of sorted) {
      const hotelId = room.hotel._id ? room.hotel._id.toString() : room.hotel.toString();
      if (!seenHotels.has(hotelId)) {
        seenHotels.add(hotelId);
        distinct.push(room);
      }
      if (distinct.length >= 4) break;
    }

    // If fewer than 4 distinct hotels, fill remaining slots with other rooms
    if (distinct.length < 4) {
      for (const room of sorted) {
        if (!distinct.some(r => r._id === room._id)) {
          distinct.push(room);
        }
        if (distinct.length >= 4) break;
      }
    }

    return distinct.slice(0, 4);
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
