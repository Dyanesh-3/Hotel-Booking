import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { assets, facilityIcons, roomCommonData } from '../assets/assets' // Fixed import path
import StarRating from '../components/StarRating'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const RoomDetails = () => {
    const { id } = useParams()
    const { rooms, getToken, axios, navigate, user }  = useAppContext()
    const [room, setRoom] = useState(null)
    const [mainImage, setMainImage] = useState(null)
    const [checkInDate, setCheckInDate] = useState(null);
    const [checkOutDate, setCheckOutDate] = useState(null);
    const [guests, setGuests] = useState(1);
    const [isAvailable, setIsAvailable] = useState(null);
    const [confirmedBooking, setConfirmedBooking] = useState(null);

    const [loading, setLoading] = useState(false);

    const checkAvailability = async () => {
        try {
            if(!checkInDate || !checkOutDate){
                toast.error('Please select Check-In and Check-Out dates')
                return;
            }
            if(checkInDate >= checkOutDate){
                toast.error('Check-In Date should be less than Check-Out Date')
                return;
            }
            setLoading(true);
            const { data } = await axios.post("/api/bookings/check-availability", {
                room: id,
                checkInDate,
                checkOutDate,
            })
            if(data.success){
                if(data.isAvailable){
                    setIsAvailable(true)
                    toast.success('Room is available')
                }else{
                    setIsAvailable(false)
                    toast.error('Room is not available')
                }
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false);
        }
    }
    // onSubmitHandler
    const onSubmitHandler = async (e) => {
        try{
            e.preventDefault()
            if(!isAvailable){
                return checkAvailability();
            }else{
                setLoading(true);
                const token = await getToken();
                const userEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress;
                const { data } = await axios.post('/api/bookings/create',{
                    room: id,
                    checkInDate,
                    checkOutDate,
                    guests,
                    paymentMethod: "Pay At Hotel",
                    userEmail
                }, { headers: { Authorization: `Bearer ${token}` } })
                if(data.success){
                    toast.success(data.message)
                    setConfirmedBooking(data.booking)
                    scrollTo(0,0)
                }else{
                    toast.error(data.message)
                }
            }
        }catch(error){
            toast.error(error.message)
        }finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        const room = rooms.find(room => room._id === id)
        room && setRoom(room)
        room && setMainImage(room.images[0])
    }, [rooms])

    return room && (
    <div className='py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32'>
        {/* Room Details */}
        <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
            <div>
                <div className='flex items-center gap-3'>
                    <h1 className='text-3xl md:text-5xl font-playfair font-bold text-gray-900'>{room.hotel.name}</h1>
                    <span className='px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-100'>{room.roomType}</span>
                </div>
                {/* Room Address*/}
                <div className='flex items-center gap-1.5 text-gray-600 mt-3'>
                    <img src={assets.locationIcon} alt="location-icon" className='h-4 opacity-70'/>
                    <span className='text-sm md:text-base'>{room.hotel.city}, {room.hotel.address}</span>
                </div>
            </div>
            {/* room Price */}
            <div className='text-right'>
                <p className='text-sm text-gray-500'>Price from</p>
                <p className='text-3xl md:text-4xl font-bold text-gray-900'>${room.pricePerNight}<span className='text-base font-normal text-gray-500'>/night</span></p>
            </div>
        </div>
        
        {/* Room Images */}
        <div className='flex flex-col lg:flex-row mt-8 gap-4 h-[60vh]'>
            <div className='lg:w-2/3 w-full h-full'>
                <img src={mainImage} alt="Room Image" className='w-full h-full rounded-2xl shadow-sm object-cover'/>
            </div>
            <div className='flex flex-row lg:flex-col gap-4 lg:w-1/3 w-full overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0'>
                {room?.images.length > 0 && room.images.map((image, index) => (
                    <img onClick={() => setMainImage(image)} key={index} src={image} alt="Room Image" className={`w-32 lg:w-full h-24 lg:h-auto lg:flex-1 rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity ${mainImage === image ? 'ring-2 ring-blue-600' : 'opacity-70'}`}/>
                ))}
            </div>
        </div>

        {/*Room Highlights & Booking*/}
        <div className='flex flex-col lg:flex-row gap-12 mt-12'>
            <div className='lg:w-2/3'>
                <h2 className='text-2xl md:text-3xl font-playfair font-bold text-gray-900 mb-6'>About this space</h2>
                <p className='text-gray-600 leading-relaxed mb-8'>
                    Experience luxury and comfort in our thoughtfully designed {room.roomType}. 
                    Located in {room.hotel.city}, this space offers everything you need for a perfect stay.
                </p>

                <h3 className='text-xl font-medium text-gray-900 mb-4'>What this place offers</h3>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mb-8'>
                    {room.amenities.map((item, index) => (
                        <div key={index} className='flex items-center gap-3 text-gray-700'>
                            <img src={facilityIcons[item]} alt={item} className='w-6 h-6 opacity-80'/>
                            <span>{item}</span>
                        </div>
                    ))}
                </div>

                <div className='border-t border-gray-200 pt-8 mt-8'>
                    <h3 className='text-xl font-medium text-gray-900 mb-6'>Things to know</h3>
                    <div className='space-y-6'>
                        {roomCommonData.map((spec, index) => (
                            <div key={index} className='flex items-start gap-4'>
                                <img src={spec.icon} alt={`${spec.title}-icon`} className='w-6 h-6 opacity-70 mt-1'/>
                                <div>
                                    <p className='font-medium text-gray-900'>{spec.title}</p>
                                    <p className='text-sm text-gray-600 mt-1'>{spec.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hosted by */}
                <div className='border-t border-gray-200 pt-8 mt-8 flex flex-col items-start gap-4'>
                    <div className='flex items-center gap-4'>
                        <img src={room.hotel.owner.image || 'https://placehold.co/100x100'} alt="Host" className='h-16 w-16 rounded-full border border-gray-200 object-cover'/>
                        <div>
                            <p className='text-lg font-medium text-gray-900'>Hosted by {room.hotel.owner.username || 'Hotel Manager'}</p>
                            <p className='text-sm text-gray-500'>{room.hotel.name}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CheckIn CheckOut Form - Sticky Sidebar */}
            <div className='lg:w-1/3'>
                <div className='sticky top-28 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 rounded-2xl border border-gray-100'>
                    <h3 className='text-2xl font-bold text-gray-900 mb-1'>${room.pricePerNight} <span className='text-base font-normal text-gray-500'>night</span></h3>
                    
                    {confirmedBooking ? (
                        <div className='mt-6 p-6 border border-green-200 bg-green-50 rounded-xl flex flex-col items-center text-center'>
                            <div className='w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4'>
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <h3 className='text-xl font-bold text-gray-900 mb-2'>Booking Confirmed!</h3>
                            <p className='text-sm text-gray-600 mb-6'>Your reservation at {room.hotel.name} has been successfully created.</p>
                            
                            <div className='w-full text-left bg-white p-4 rounded-lg border border-gray-100 mb-6 space-y-3 text-sm'>
                                <div className='flex justify-between'><span className='text-gray-500'>Booking ID</span><span className='font-medium'>{confirmedBooking._id}</span></div>
                                <div className='flex justify-between'><span className='text-gray-500'>Check-in</span><span className='font-medium'>{new Date(checkInDate).toLocaleDateString()}</span></div>
                                <div className='flex justify-between'><span className='text-gray-500'>Check-out</span><span className='font-medium'>{new Date(checkOutDate).toLocaleDateString()}</span></div>
                                <div className='flex justify-between'><span className='text-gray-500'>Amount</span><span className='font-medium'>{currency}{confirmedBooking.totalPrice || (room.pricePerNight * Math.max(1, Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 3600 * 24))))}</span></div>
                                <div className='flex justify-between'><span className='text-gray-500'>Payment</span><span className='font-medium text-amber-600'>Pay at Hotel</span></div>
                            </div>
                            
                            <div className='w-full flex flex-col gap-3'>
                                <button onClick={() => navigate('/my-bookings')} className='w-full py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors'>View My Bookings</button>
                                <button onClick={() => navigate('/rooms')} className='w-full py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors'>Continue Browsing</button>
                            </div>
                        </div>
                    ) : (
                    <form onSubmit={onSubmitHandler} className='mt-6 flex flex-col gap-4'>
                        <div className='border border-gray-300 rounded-xl overflow-hidden'>
                            <div className='flex border-b border-gray-300'>
                                <div className='flex-1 p-3 border-r border-gray-300'>
                                    <label htmlFor="checkInDate" className='block text-xs font-bold text-gray-900 uppercase'>Check-In</label>
                                    <input onChange ={(e)=> { setCheckInDate(e.target.value); setIsAvailable(null); }} min={new Date().toISOString().split('T')[0]} type="date" id='checkInDate' className='w-full text-sm outline-none mt-1 text-gray-600 bg-transparent' required/>
                                </div> 
                                <div className='flex-1 p-3'>
                                    <label htmlFor="checkOutDate" className='block text-xs font-bold text-gray-900 uppercase'>Check-Out</label>
                                    <input onChange ={(e)=> { setCheckOutDate(e.target.value); setIsAvailable(null); }} min={checkInDate} disabled={!checkInDate}  type="date" id='checkOutDate' className='w-full text-sm outline-none mt-1 text-gray-600 bg-transparent' required/>
                                </div>
                            </div>
                            <div className='p-3'>
                                <label htmlFor="guests" className='block text-xs font-bold text-gray-900 uppercase'>Guests</label>
                                <input onChange ={(e)=> setGuests(e.target.value)} value={guests} type="number" min="1" id='guests' className='w-full text-sm outline-none mt-1 text-gray-600 bg-transparent' required/>
                            </div>
                        </div>

                        {isAvailable && checkInDate && checkOutDate && (
                            <div className='bg-gray-50 p-4 rounded-lg space-y-2 mb-2'>
                                <div className='flex justify-between text-sm text-gray-600'>
                                    <span>${room.pricePerNight} x {Math.max(1, Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 3600 * 24)))} nights</span>
                                    <span>${room.pricePerNight * Math.max(1, Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 3600 * 24)))}</span>
                                </div>
                                <div className='border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900'>
                                    <span>Total</span>
                                    <span>${room.pricePerNight * Math.max(1, Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 3600 * 24)))}</span>
                                </div>
                            </div>
                        )}

                        <button disabled={loading} type='submit' className={`w-full py-4 text-base font-semibold rounded-xl text-white transition-all disabled:opacity-70 disabled:cursor-not-allowed ${isAvailable ? 'bg-black hover:bg-gray-800' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            {loading ? "Processing..." : (isAvailable ? "Reserve" : "Check Availability")}
                        </button>
                        
                        <p className='text-center text-sm text-gray-500 mt-2'>You won't be charged yet</p>
                    </form>
                    )}
                </div>
            </div>
        </div>
    </div>
  )
}

export default RoomDetails