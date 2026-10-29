import React, { useState, useEffect } from 'react'
import HotelCard from '../HotelCard'
import Title from '../Title'
import { useAppContext } from '../../context/AppContext'

const RecommendedHotels = () => {

  const { rooms, searchedCities, fetchRooms } = useAppContext();
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    if (fetchRooms) {
      fetchRooms();
    }
  }, []);

  const filterHotels = () => {
    if (!rooms || rooms.length === 0) {
      setRecommended([]);
      return;
    }

    const validRooms = rooms.filter(room => room && room.hotel && room.hotel.name);

    let filteredRooms = [];
    if (searchedCities && searchedCities.length > 0) {
      filteredRooms = validRooms.filter(room => room?.hotel?.city && searchedCities.includes(room.hotel.city));
    }
    if (filteredRooms.length === 0) {
      filteredRooms = validRooms;
    }

    // Group rooms by hotel ID
    const roomsByHotel = new Map();
    for (const room of filteredRooms) {
      const hotelId = room.hotel._id ? room.hotel._id.toString() : room.hotel.toString();
      if (!hotelId) continue;
      if (!roomsByHotel.has(hotelId)) {
        roomsByHotel.set(hotelId, []);
      }
      roomsByHotel.get(hotelId).push(room);
    }

    // Select best representative room per hotel
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

    // Sort distinct hotels: hotels with images first, then newest
    distinctHotels.sort((a, b) => {
      const aHasImg = a.images && a.images.length > 0 && a.images[0] ? 1 : 0;
      const bHasImg = b.images && b.images.length > 0 && b.images[0] ? 1 : 0;
      if (bHasImg !== aHasImg) return bHasImg - aHasImg;
      const aDate = new Date(a.hotel?.createdAt || a.createdAt);
      const bDate = new Date(b.hotel?.createdAt || b.createdAt);
      return bDate - aDate;
    });

    setRecommended(distinctHotels.slice(0, 4));
  }

  useEffect(() => {
    filterHotels();
  }, [rooms, searchedCities]);

  return recommended.length > 0 && (
    <div className='flex flex-col items-center px-6 md:px-16 lg:px-24 py-20'>
      <Title title='Recommended Hotels' subTitle='Discover our handpicked selection of exceptional properties around the world, offering unparalleled luxury and unforgettable experiences.'/>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 w-full'>
        {recommended.map((room, index) => (
          <HotelCard key={room._id} room={room} index={index}/>
        ))}
      </div>
    </div>
  )
}

export default RecommendedHotels;
