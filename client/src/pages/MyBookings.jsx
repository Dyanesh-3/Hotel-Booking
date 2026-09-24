import React, { useState, useEffect } from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const MyBookings = () => {
    const { axios, getToken, user, currency } = useAppContext()
    const [bookings, setBookings] = useState([])

    const [loading, setLoading] = useState(true)

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
        } finally {
            setLoading(false)
        }
    }

    const handlePayment = async (bookingId)=>{
        try {
            const { data } = await axios.post('/api/bookings/stripe-payment',{bookingId}, {headers: {Authorization: `Bearer ${await getToken()}`}})
            if(data.success){
                window.location.href = data.url
            }
            else{
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
            
            <div className='max-w-5xl mt-12 w-full text-gray-800 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8'>
                <div className='flex flex-col gap-6'>
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className='flex flex-col md:flex-row gap-6 p-4 border border-gray-100 rounded-xl animate-pulse'>
                                <div className='w-full md:w-56 h-36 bg-gray-200 rounded-lg'></div>
                                <div className='flex-1 flex flex-col gap-3 py-2'>
                                    <div className='h-6 bg-gray-200 rounded w-1/2'></div>
                                    <div className='h-4 bg-gray-200 rounded w-1/3'></div>
                                    <div className='h-4 bg-gray-200 rounded w-1/4 mt-4'></div>
                                </div>
                            </div>
                        ))
                    ) : bookings.length === 0 ? (
                        <div className='py-16 text-center flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-100'>
                            <div className='w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4'>
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                            </div>
                            <h3 className='text-xl font-medium text-gray-900 mb-2'>You haven't made any bookings yet.</h3>
                            <p className='text-gray-500 max-w-sm mb-6'>Explore our handpicked selection of exceptional properties and plan your next stay.</p>
                            <button onClick={() => window.location.href='/rooms'} className='px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors font-medium'>Explore Hotels</button>
                        </div>
                    ) : (
                        bookings.map((booking) => (
                            <div key={booking._id} className='flex flex-col md:flex-row gap-6 p-5 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all rounded-xl'>
                                {/* ------ Hotel Details ------ */}
                                <div className='shrink-0'>
                                    <img 
                                        src={booking.room?.images?.[0] || 'https://placehold.co/600x400?text=Room'} 
                                        alt="hotel-img" 
                                        className='w-full md:w-56 h-40 rounded-xl object-cover' 
                                    />
                                </div>
                                
                                <div className='flex-1 flex flex-col justify-between'>
                                    <div className='flex flex-col md:flex-row md:justify-between items-start gap-4'>
                                        <div>
                                            <div className='flex items-center gap-2 mb-1'>
                                                <p className='text-xs font-bold tracking-wider text-blue-600 uppercase'>{booking.hotel?.city || 'City'}</p>
                                                <span className='text-gray-300 text-xs'>•</span>
                                                <p className='text-xs font-medium text-gray-500'>Booking ID: <span className='font-mono'>{booking._id.substring(0,8)}</span></p>
                                            </div>
                                            <h3 className='font-playfair font-bold text-2xl text-gray-900 mb-1'>
                                                {booking.hotel?.name || 'Hotel'}
                                            </h3>
                                            <p className='text-gray-600 font-medium'>{booking.room?.roomType || 'Room'}</p>
                                            
                                            <div className='flex items-center gap-1.5 text-sm text-gray-500 mt-3'>
                                                <img src={assets.locationIcon} alt="location" className='h-3.5 opacity-60'/>
                                                <span>{booking.hotel?.address || 'Location unavailable'}</span>
                                            </div>
                                        </div>
                                        
                                        <div className='flex flex-col items-start md:items-end w-full md:w-auto mt-4 md:mt-0 bg-gray-50 p-4 rounded-lg border border-gray-100'>
                                            <div className='flex justify-between md:flex-col md:items-end w-full gap-1'>
                                                <p className='text-xs text-gray-500 font-medium uppercase tracking-wide'>Total Amount</p>
                                                <p className='text-xl font-bold text-gray-900'>{currency}{booking.totalPrice}</p>
                                            </div>
                                            <div className='mt-3 flex justify-between md:flex-col md:items-end w-full gap-2'>
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${booking.isPaid ? "bg-green-100 border border-green-200" : "bg-orange-100 border border-orange-200"}`}>
                                                    <div className={`h-1.5 w-1.5 rounded-full ${booking.isPaid ? "bg-green-600" : "bg-orange-500"}`}></div>
                                                    <p className={`text-xs font-bold uppercase tracking-wider ${booking.isPaid ? "text-green-700" : "text-orange-700"}`}>
                                                        {booking.isPaid ? "Paid" : "Pending"}
                                                    </p>
                                                </div>
                                                {!booking.isPaid && (
                                                    <button onClick={()=>handlePayment(booking._id)}
                                                    className='px-4 py-1.5 text-xs font-semibold bg-black text-white rounded-lg hover:bg-gray-800 transition-colors'>
                                                        Pay Now
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100'>
                                        <div>
                                            <p className='text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide'>Check-In</p>
                                            <p className='text-sm font-semibold text-gray-900'>{new Date(booking.checkInDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        </div>
                                        <div>
                                            <p className='text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide'>Check-Out</p>
                                            <p className='text-sm font-semibold text-gray-900'>{new Date(booking.checkOutDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        </div>
                                        <div>
                                            <p className='text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide'>Guests</p>
                                            <p className='text-sm font-semibold text-gray-900'>{booking.guests} {booking.guests > 1 ? 'Guests' : 'Guest'}</p>
                                        </div>
                                    </div>
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