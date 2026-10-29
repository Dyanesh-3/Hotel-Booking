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

    // Prioritize rooms with valid images
    const sorted = [...filteredRooms].sort((a, b) => {
      const aHas = (a.images && a.images.length > 0 && a.images[0]) ? 1 : 0;
      const bHas = (b.images && b.images.length > 0 && b.images[0]) ? 1 : 0;
      return bHas - aHas;
    });

    // Deduplicate by hotel
    const seen = new Set();
    const distinct = [];
    for (const r of sorted) {
      const hId = r.hotel?._id?.toString() || r.hotel?.toString();
      if (hId && !seen.has(hId)) {
        seen.add(hId);
        distinct.push(r);
      }
      if (distinct.length >= 4) break;
    }

    setRecommended(distinct);
  }

  useEffect(() => {
    filterHotels();
  }, [rooms, searchedCities]);

  return recommended.length > 0 && (
    <div className='flex flex-col items-center px-6 md:px-16 lg:px-24 py-20'>
      <Title title='Recommended Hotels' subTitle='Discover our handpicked selection of exceptional properties around the world, offering unparalleled luxury and unforgettable experiences.'/>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 w-full'>
        {recommended.slice(0, 4).map((room, index) => (
          <HotelCard key={room._id} room={room} index={index}/>
        ))}
      </div>
    </div>
  )
}

export default RecommendedHotels;
