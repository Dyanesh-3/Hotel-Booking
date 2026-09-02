import React, { useState, useEffect } from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const MyBookings = () => {
    const { axios, getToken, user, currency } = useAppContext()
    const [bookings, setBookings] = useState([])

    const fetchUserBookings = async () => {
        try {
            const token = await getToken()
            if (!token) return

            const { data } = await axios.get('/api/booking/user', {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                setBookings(data.bookings || [])
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (user) {
            fetchUserBookings()
        }
    }, [user])

    return (
        <div className='py-28 md:py-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32'>
            <Title title='My Bookings' subTitle='Easily manage your past, current, and upcoming hotel reservations in one place. Plan your trips seamlessly with just a few clicks' align='left' />
            <div className='max-w-6xl mt-8 w-full text-gray-800'>
                <div className='hidden md:grid md:grid-cols-[2fr_1.5fr_1fr] w-full border-b border-gray-100 font-medium text-base py-3'>
                    <div className="text-gray-700">Hotels</div>
                    <div className="text-left text-gray-700">Date & Timings</div>
                    <div className="text-right text-gray-700">Payment</div>
                </div>
                <div className='flex flex-col'>
                    {bookings.length === 0 ? (
                        <div className='py-12 text-center text-gray-500'>
                            <p className='text-lg font-medium'>No bookings found yet.</p>
                            <p className='text-sm mt-1'>Explore rooms and book your next stay!</p>
                        </div>
                    ) : (
                        bookings.map((booking) => (
                            <div key={booking._id} className='grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1fr] w-full border-b border-gray-50 py-8 last:border-0'>
                                {/* ------ Hotel Details ------ */}
                                <div className='flex flex-col md:flex-row gap-6'>
                                    <img 
                                        src={booking.room?.images?.[0] || 'https://placehold.co/600x400?text=Room'} 
                                        alt="hotel-img" 
                                        className='w-full md:w-56 h-36 rounded-lg object-cover' 
                                    />
                                    <div className='flex flex-col gap-1'>
                                        <p className='font-medium text-lg text-gray-800'>
                                            {booking.hotel?.name || 'Hotel'}
                                            <span className='text-sm text-gray-500 ml-1 font-normal'>
                                                ({booking.room?.roomType || 'Room'})
                                            </span>
                                        </p>
                                        <div className='flex items-center gap-1 text-sm text-gray-500'>
                                            <span className='opacity-70'>📍</span>
                                            <span>{booking.hotel?.address || 'Location unavailable'}</span>
                                        </div>
                                        <div className='flex items-center gap-1 text-sm text-gray-500'>
                                            <span className='opacity-70'>👤</span>
                                            <span>Guests: {booking.guests}</span>
                                        </div>
                                        <p className='text-base font-semibold mt-2'>Total: {currency} {booking.totalPrice}</p>
                                    </div>
                                </div>
                                {/* ------ Date & Timings ------ */}
                                <div className='flex flex-row items-start justify-start gap-8 md:gap-14 mt-6 md:mt-4'>
                                    <div className='flex flex-col'>
                                        <p className='text-sm font-medium text-gray-700'>Check-In:</p>
                                        <p className='text-gray-500 text-sm'>{new Date(booking.checkInDate).toDateString()}</p>
                                    </div>
                                    <div className='flex flex-col'>
                                        <p className='text-sm font-medium text-gray-700'>Check-Out:</p>
                                        <p className='text-gray-500 text-sm'>{new Date(booking.checkOutDate).toDateString()}</p>
                                    </div>
                                </div>
                                {/* ------ Payment Status ------ */}
                                <div className='flex flex-col items-end justify-start mt-6 md:mt-4'>
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${booking.isPaid ? "bg-green-50" : "bg-red-50"}`}>
                                        <div className={`h-2 w-2 rounded-full ${booking.isPaid ? "bg-green-600" : "bg-red-600"}`}></div>
                                        <p className={`text-xs font-medium ${booking.isPaid ? "text-green-600" : "text-red-600"}`}>
                                            {booking.isPaid ? "Paid" : "Unpaid"}
                                        </p>
                                    </div>
                                    {!booking.isPaid && (
                                        <button className='px-6 py-1.5 mt-4 text-xs border border-gray-200 rounded-full hover:bg-gray-50 transition-all cursor-pointer font-medium text-gray-600'>
                                            Pay Now
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default MyBookings