import React, { useState, useMemo } from 'react'
import { roomsDummyData, assets, facilityIcons } from '../assets/assets'
import { useNavigate, useSearchParams } from 'react-router-dom'
import StarRating from '../components/StarRating'
import { useAppContext } from '../context/AppContext'

const CheckBox = ({label, selected = false, onChange = ()=>{}})=>{
    return(
        <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
            <input type="checkbox" checked={selected} onChange={(e)=>onChange(e.target.checked,label)}/>
            <span className='font-light select-none'>{label}</span>
        </label>
    )
}
const RadioButton = ({label, selected = false, onChange = ()=>{ }})=>{
    return(
        <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
            <input type="radio" name="sortOption" checked={selected} onChange={()=>onChange(label)}/>
            <span className='font-light select-none'>{label}</span>
        </label>
    )
}
const AllRooms = () => {

    const { rooms, navigate, currency } = useAppContext();
    const [searchParams, setSearchParams] = useSearchParams();
    const [openFilters, setOpenFilters] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState({
        roomType: [],
        priceRange: [],
    });
    const [selectedSort, setSelectedSort] = useState('');

    const roomTypes = [
        "Single Bed",
        "Double Bed",
        "Luxury Room",
        "Family Suite",
    ];
    const priceRange =[
        "0 to 500",
        "500 to 1000",
        "1000 to 2000",
        "2000 to 3000",
    ];
    const sortOptions = [
        "Price Low to High",
        "Price High to Low",
        "Newest First",
    ];

    // Handle changes for filters and sorting
    const handleFilterChange = (checked, value, type)=>{
        setSelectedFilters((prevFilters)=>{
            const updatedFilters = {...prevFilters};
            if(checked){
                updatedFilters[type].push(value);
            }else{
                updatedFilters[type] = updatedFilters[type].filter(item => item !== value);
            }
            return updatedFilters;
        })
    }
    const handleSortChange = (sortOption)=>{
        setSelectedSort(sortOption);
    }
    const matchesRoomType = (room)=>{
        return selectedFilters.roomType.length === 0 || selectedFilters.roomType.includes(room.roomType);
    }
    const matchesPriceRange=(room)=>{
        return selectedFilters.priceRange.length === 0 || selectedFilters.priceRange.some(range=>{
            const[min,max] = range.split(' to ').map(Number);
            return room.pricePerNight >= min && room.pricePerNight <=max;
        })
    }
    // Function to sort rooms based on the selected sort option
    const sortRooms=(a, b)=>{
        if(selectedSort === 'Price Low to High'){
            return a.pricePerNight - b.pricePerNight;
        }
        if(selectedSort === 'Price High to Low'){
            return b.pricePerNight - a.pricePerNight;
        }
        if(selectedSort === 'Newest First'){
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return 0;
    }
    //Filter Destination
    const filterDestination = (room)=>{
        const destination = searchParams.get('destination');
        if(!destination) return true;
        return room.hotel.city.toLowerCase().includes(destination.toLowerCase());
    }
    //Filter Check-in and Check-out
    const filteredRooms = useMemo(()=>{
        return rooms.filter(room => 
            filterDestination(room) && matchesRoomType(room) && matchesPriceRange(room)
        )
    },[rooms, selectedFilters, selectedSort, searchParams])

    const clearFilters = ()=>{
        setSelectedFilters({
            roomType:[],
            priceRange:[],
        })
        setSelectedSort('');
        setSearchParams({});
    } 
  return (
    <div className='flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32'>
        <div>
            <div className='flex flex-col items-start text-left'>
                <h1 className='font-playfair text-4xl md:text-[40px]'>Hotel Rooms</h1>
                <p className='font-sm md:text-base text-gray-500/90 mt-2'>Take advantage of our limited-time offers and special packages to enhance your stay and create unforgettable memories.</p>
            </div>
            {rooms.length === 0 ? (
                Array(4).fill(0).map((_, i) => (
                    <div key={i} className='flex flex-col md:flex-row items-start py-8 border-b border-gray-100 gap-8 p-4 rounded-2xl animate-pulse'>
                        <div className="md:w-1/3 shrink-0 h-48 bg-gray-200 rounded-xl"></div>
                        <div className='md:w-2/3 flex flex-col gap-3 pt-2 w-full'>
                            <div className='h-4 bg-gray-200 rounded w-16'></div>
                            <div className='h-8 bg-gray-200 rounded w-3/4'></div>
                            <div className='h-5 bg-gray-200 rounded w-1/4'></div>
                            <div className='h-4 bg-gray-200 rounded w-1/2 mt-2'></div>
                            <div className='flex gap-2 mt-4'>
                                <div className='h-8 bg-gray-200 rounded w-16'></div>
                                <div className='h-8 bg-gray-200 rounded w-16'></div>
                                <div className='h-8 bg-gray-200 rounded w-16'></div>
                            </div>
                        </div>
                    </div>
                ))
            ) : filteredRooms.length === 0 ? (
                <div className='py-20 text-center flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 mt-8 min-h-[300px]'>
                    <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <h3 className='text-xl font-medium text-gray-900 mb-2'>No rooms found</h3>
                    <p className='text-gray-500 max-w-sm'>We couldn't find any rooms matching your current filters. Try adjusting your search criteria.</p>
                    <button onClick={clearFilters} className='mt-6 px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors'>Clear Filters</button>
                </div>
            ) : (
                filteredRooms.map((room) => (
                    <div key={room._id} className='flex flex-col md:flex-row items-start py-8 border-b border-gray-100 gap-8 hover:bg-gray-50/50 p-4 rounded-2xl transition-colors'>
                        <div className="md:w-1/3 shrink-0">
                            <img onClick={() => { navigate(`/rooms/${room._id}`); scrollTo(0, 0) }} src={room.images[0]} alt="hotel-img" title='View Room Details' className='w-full aspect-[4/3] rounded-xl shadow-sm object-cover cursor-pointer hover:shadow-md transition-shadow'/>
                        </div>
                        <div className='md:w-2/3 flex flex-col gap-2 pt-2'>
                            <p className='text-sm font-semibold tracking-wider text-blue-600 uppercase'>{room.hotel.city}</p>
                            <p onClick={() => { navigate(`/rooms/${room._id}`); scrollTo(0, 0) }} className='text-gray-900 text-3xl font-playfair font-bold cursor-pointer hover:text-blue-600 transition-colors'>{room.hotel.name}</p>
                            <p className='text-lg text-gray-700 font-medium'>{room.roomType}</p>
                            <div className='flex items-center gap-1.5 text-gray-500 mt-1 text-sm'>
                                <img src={assets.locationIcon} alt="location-icon" className='h-4 opacity-70'/>
                                <span>{room.hotel.address}</span>
                            </div>
                                {/* Room Amenities */}
                            <div className='flex flex-wrap items-center mt-4 mb-6 gap-3'>
                                {Array.isArray(room.amenities) && room.amenities.map((item, index) => (
                                    <div key={index} className='flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white'>
                                        <img src={facilityIcons[item]} alt={item} className='w-4 h-4 opacity-70'/>
                                        <p className='text-xs font-medium text-gray-600'>{item}</p>
                                    </div>
                                ))}
                            </div>
                            {/* Room Price per Night */}
                            <div className='mt-auto flex items-end justify-between'>
                                <div>
                                    <p className='text-sm text-gray-500'>Price from</p>
                                    <p className='text-2xl font-bold text-gray-900'>{currency}{room.pricePerNight} <span className='text-sm font-normal text-gray-500'>/night</span></p>
                                </div>
                                <button onClick={() => { navigate(`/rooms/${room._id}`); scrollTo(0, 0) }} className='px-6 py-2.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors'>View Details</button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
        {/*Filters*/}
        <div className='bg-white w-80 border border-gray-300 text-gray-600 max-lg:mb-8 lg:mt-16'>
            <div className = {`flex items-center justify-between px-5 py-2.5 lg:border-b border-gray-300 ${openFilters && "border-b"}`}>
                <p className='text-base font-medium text-gray-800'>FILTERS</p>
                <div className='text-xs cursor-pointer'>
                    <span onClick={()=> setOpenFilters(!openFilters)} className='lg:hidden'> {openFilters? 'HIDE':'SHOW'}</span>
                    <span className='hidden lg:block'>CLEAR</span>
                </div>
            </div> 
            <div className={`${openFilters? 'h-auto':"h-0 lg:h-auto"} overflow-hidden transition-all duration-700`}>
                <div className='px-5 pt-5'>
                    <p className='font-medium text-gray-800 pb-2'>Popular filters</p>
                {roomTypes.map((room,index)=>(
                    <CheckBox key={index} label={room} selected={selectedFilters.roomType.includes(room)} onChange={(checked)=>handleFilterChange(checked, room, 'roomType')}/>
                ))}
                </div>
                <div className='px-5 pt-5'>
                    <p className='font-medium text-gray-800 pb-2'>Price Range</p>
                {priceRange.map((range,index)=>(
                    <CheckBox key={index} label={`${currency} ${range}`} selected={selectedFilters.priceRange.includes(range)} onChange={(checked)=>handleFilterChange(checked, range, 'priceRange')}/>
                ))}
                </div>
                <div className='px-5 pt-5 pb-7'>
                    <p className='font-medium text-gray-800 pb-2'>Sort By</p>
                    {sortOptions.map((option,index)=>(
                        <RadioButton key={index} label={option} selected={selectedSort === option} onChange={()=>handleSortChange(option)}/>
                ))}
                </div>
                
            </div>
        </div>
    </div>
  )
}

export default AllRooms