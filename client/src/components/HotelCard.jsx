import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const Hotelcard = ({room}) => {
  return (
    <Link to={'/rooms/' + room._id} onClick={() => scrollTo(0,0)} className='relative w-full rounded-xl overflow-hidden bg-white text-gray-500 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300'>
        <img src={room.images?.[0] || 'https://placehold.co/600x400?text=No+Image'} alt="" className='w-full h-52 object-cover block' />
        <div className='p-5'>   
            <div className='flex items-center justify-between mb-2'>   
                <p className='font-playfair text-xl font-bold text-gray-900'>{room.hotel.name}</p>
            </div>
            <div className='flex items-center gap-1.5 text-sm text-gray-600 mb-4'>
                <img src={assets.locationIcon} alt="location-icon" className='h-4 opacity-70'/> 
                <span className='truncate'>{room.hotel.city}, {room.hotel.address}</span>
            </div>
            <div className='flex items-center justify-between mt-4 pt-4 border-t border-gray-100'> 
                <p className='text-sm text-gray-500'><span className='text-xl font-semibold text-gray-900'>${room.pricePerNight}</span> /night</p>
                <button className='px-4 py-2 text-sm font-semibold bg-black text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer'>
                    View Details
                </button>
            </div>
        </div>
    </Link>
  )
}

export default Hotelcard
