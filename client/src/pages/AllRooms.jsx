import React, { useState, useEffect } from 'react'
import { assets, facilityIcons } from '../assets/assets'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
    const { navigate, currency, axios } = useAppContext();
    const [searchParams, setSearchParams] = useSearchParams();
    const [openFilters, setOpenFilters] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Data State
    const [rooms, setRooms] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

    const roomTypes = [
        "Single Bed",
        "Double Bed",
        "Luxury Room",
        "Family Suite",
    ];

    const sortOptions = [
        { label: "Price Low to High", value: "price_asc" },
        { label: "Price High to Low", value: "price_desc" },
        { label: "Newest First", value: "newest" },
        { label: "Name A-Z", value: "name_asc" },
    ];

    // Read current state from URL params to ensure it survives refresh
    const currentCity = searchParams.get('city') || searchParams.get('destination') || '';
    const currentSearch = searchParams.get('search') || '';
    const currentMinPrice = searchParams.get('minPrice') || '';
    const currentMaxPrice = searchParams.get('maxPrice') || '';
    const currentSort = searchParams.get('sort') || '';
    const currentPage = parseInt(searchParams.get('page')) || 1;

    // Fetch data whenever URL changes
    useEffect(() => {
        const fetchFilteredRooms = async () => {
            setLoading(true);
            try {
                // Construct query string for backend
                const query = new URLSearchParams();
                if (currentCity) query.append('city', currentCity);
                if (currentSearch) query.append('search', currentSearch);
                if (currentMinPrice) query.append('minPrice', currentMinPrice);
                if (currentMaxPrice) query.append('maxPrice', currentMaxPrice);
                if (currentSort) query.append('sort', currentSort);
                query.append('page', currentPage);
                query.append('limit', 12);

                const { data } = await axios.get(`/api/room?${query.toString()}`);
                if (data.success) {
                    setRooms(data.rooms);
                    setPagination(data.pagination);
                }
            } catch (error) {
                console.error("Error fetching rooms", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFilteredRooms();
    }, [searchParams]);

    // Handlers to update URL which will trigger the fetch
    const updateParam = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        newParams.set('page', 1); // Reset to page 1 on filter change
        setSearchParams(newParams);
    };

    const handleSortChange = (sortOptionValue) => {
        updateParam('sort', sortOptionValue);
    }

    const clearFilters = () => {
        setSearchParams({});
    } 

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            const newParams = new URLSearchParams(searchParams);
            newParams.set('page', newPage);
            setSearchParams(newParams);
            window.scrollTo(0, 0);
        }
    }

  return (
    <div className='flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32'>
        <div className='w-full'>
            <div className='flex flex-col md:flex-row md:items-end justify-between text-left mb-6 gap-4'>
                <div>
                    <h1 className='font-playfair text-4xl md:text-[40px]'>Hotel Rooms</h1>
                    <p className='font-sm md:text-base text-gray-500/90 mt-2'>Take advantage of our limited-time offers and special packages to enhance your stay and create unforgettable memories.</p>
                </div>
                
                {/* Search Bar */}
                <div className='flex gap-2 w-full md:w-auto'>
                    <input 
                        type="text" 
                        placeholder="Search hotels, cities..." 
                        value={currentSearch}
                        onChange={(e) => updateParam('search', e.target.value)}
                        className='border border-gray-300 rounded-lg px-4 py-2 text-sm w-full md:w-64 focus:outline-none focus:border-black'
                    />
                </div>
            </div>

            {loading ? (
                Array(4).fill(0).map((_, i) => (
                    <div key={i} className='flex flex-col md:flex-row items-start py-8 border-b border-gray-100 gap-8 p-4 rounded-2xl animate-pulse'>
                        <div className="md:w-1/3 shrink-0 h-48 bg-gray-200 rounded-xl"></div>
                        <div className='md:w-2/3 flex flex-col gap-3 pt-2 w-full'>
                            <div className='h-4 bg-gray-200 rounded w-16'></div>
                            <div className='h-8 bg-gray-200 rounded w-3/4'></div>
                            <div className='h-5 bg-gray-200 rounded w-1/4'></div>
                            <div className='h-4 bg-gray-200 rounded w-1/2 mt-2'></div>
                        </div>
                    </div>
                ))
            ) : rooms.length === 0 ? (
                <div className='py-20 text-center flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 mt-8 min-h-[300px]'>
                    <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <h3 className='text-xl font-medium text-gray-900 mb-2'>No rooms found</h3>
                    <p className='text-gray-500 max-w-sm'>We couldn't find any rooms matching your current filters. Try adjusting your search criteria.</p>
                    <button onClick={clearFilters} className='mt-6 px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors'>Clear Filters</button>
                </div>
            ) : (
                <>
                {rooms.map((room) => (
                    <div key={room._id} className='flex flex-col md:flex-row items-start py-8 border-b border-gray-100 gap-8 hover:bg-gray-50/50 p-4 rounded-2xl transition-colors'>
                        <div className="md:w-1/3 shrink-0">
                            <img onClick={() => { navigate(`/rooms/${room._id}`); window.scrollTo(0, 0) }} src={room.images?.[0] || 'https://placehold.co/600x400?text=No+Image'} alt="hotel-img" title='View Room Details' className='w-full aspect-[4/3] rounded-xl shadow-sm object-cover cursor-pointer hover:shadow-md transition-shadow'/>
                        </div>
                        <div className='md:w-2/3 flex flex-col gap-2 pt-2'>
                            <p className='text-sm font-semibold tracking-wider text-blue-600 uppercase'>{room.hotel.city}</p>
                            <p onClick={() => { navigate(`/rooms/${room._id}`); window.scrollTo(0, 0) }} className='text-gray-900 text-3xl font-playfair font-bold cursor-pointer hover:text-blue-600 transition-colors'>{room.hotel.name}</p>
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
                                <button onClick={() => { navigate(`/rooms/${room._id}`); window.scrollTo(0, 0) }} className='px-6 py-2.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors'>View Details</button>
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                    <div className='flex items-center justify-center gap-2 mt-10 pb-10'>
                        <button 
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className='px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            Previous
                        </button>
                        
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`w-10 h-10 rounded flex items-center justify-center border ${pagination.page === page ? 'bg-black text-white border-black' : 'border-gray-300 hover:bg-gray-50'}`}
                            >
                                {page}
                            </button>
                        ))}

                        <button 
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className='px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            Next
                        </button>
                    </div>
                )}
                </>
            )}
        </div>

        {/*Filters Sidebar*/}
        <div className='bg-white w-full lg:w-80 lg:shrink-0 border border-gray-300 text-gray-600 max-lg:mb-8 lg:mt-24 lg:ml-8 rounded-lg overflow-hidden'>
            <div className={`flex items-center justify-between px-5 py-4 bg-gray-50 lg:border-b border-gray-300 ${openFilters && "border-b"}`}>
                <p className='text-base font-medium text-gray-800'>FILTERS</p>
                <div className='text-xs cursor-pointer font-medium text-blue-600'>
                    <span onClick={() => setOpenFilters(!openFilters)} className='lg:hidden mr-4'> {openFilters ? 'HIDE' : 'SHOW'}</span>
                    <span onClick={clearFilters}>CLEAR ALL</span>
                </div>
            </div> 
            
            <div className={`${openFilters ? 'h-auto' : "h-0 lg:h-auto"} overflow-hidden transition-all duration-300`}>
                
                {/* City Filter */}
                <div className='px-5 pt-5 pb-2 border-b border-gray-100'>
                    <p className='font-medium text-gray-800 pb-2'>City</p>
                    <input 
                        type="text" 
                        placeholder="E.g. Delhi, Mumbai" 
                        value={currentCity}
                        onChange={(e) => updateParam('city', e.target.value)}
                        className='border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-black'
                    />
                </div>

                {/* Price Range */}
                <div className='px-5 pt-5 pb-5 border-b border-gray-100'>
                    <p className='font-medium text-gray-800 pb-3'>Price Range</p>
                    <div className='flex items-center gap-2'>
                        <input 
                            type="number" 
                            placeholder="Min" 
                            value={currentMinPrice}
                            onChange={(e) => updateParam('minPrice', e.target.value)}
                            className='border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-black'
                        />
                        <span className='text-gray-400'>-</span>
                        <input 
                            type="number" 
                            placeholder="Max" 
                            value={currentMaxPrice}
                            onChange={(e) => updateParam('maxPrice', e.target.value)}
                            className='border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-black'
                        />
                    </div>
                </div>

                {/* Sort By */}
                <div className='px-5 pt-5 pb-7'>
                    <p className='font-medium text-gray-800 pb-2'>Sort By</p>
                    {sortOptions.map((option, index) => (
                        <RadioButton 
                            key={index} 
                            label={option.label} 
                            selected={currentSort === option.value} 
                            onChange={() => handleSortChange(option.value)}
                        />
                    ))}
                </div>
            </div>
        </div>
    </div>
  )
}

export default AllRooms
