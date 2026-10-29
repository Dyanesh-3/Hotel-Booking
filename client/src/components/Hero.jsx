import React, { useState, useEffect, useRef, useMemo } from 'react'
import { assets, cities as fallbackCities } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import { toast } from 'react-hot-toast'

// Local date helpers to avoid timezone boundary shifts
const getTodayLocalDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getNextLocalDate = (baseDateStr) => {
  if (!baseDateStr) return '';
  const [y, m, d] = baseDateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Hero = () => {
  const { navigate, getToken, axios, setSearchedCities } = useAppContext();

  // Form states
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [dateError, setDateError] = useState("");

  // Autocomplete states
  const [availableDestinations, setAvailableDestinations] = useState([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Fetch real destinations from MongoDB backend
  useEffect(() => {
    let isMounted = true;
    const fetchDestinations = async () => {
      setLoadingDestinations(true);
      try {
        const { data } = await axios.get('/api/hotels/destinations');
        if (isMounted) {
          if (data.success && Array.isArray(data.destinations) && data.destinations.length > 0) {
            setAvailableDestinations(data.destinations);
          } else {
            setAvailableDestinations(fallbackCities);
          }
        }
      } catch (err) {
        if (isMounted) {
          setAvailableDestinations(fallbackCities);
        }
      } finally {
        if (isMounted) {
          setLoadingDestinations(false);
        }
      }
    };

    fetchDestinations();
    return () => { isMounted = false; };
  }, [axios]);

  // Click outside listener to close autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter suggestions case-insensitively based on user input
  const filteredDestinations = useMemo(() => {
    if (!destination || !destination.trim()) {
      return availableDestinations;
    }
    const query = destination.trim().toLowerCase();
    return availableDestinations.filter((city) =>
      city.toLowerCase().includes(query)
    );
  }, [availableDestinations, destination]);

  // Scroll highlighted item into view if navigating with keyboard
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const items = dropdownRef.current.querySelectorAll('.autocomplete-item');
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  // Keyboard navigation inside destination input
  const handleDestinationKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isDropdownOpen) {
        setIsDropdownOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex((prev) =>
          prev < filteredDestinations.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isDropdownOpen) {
        setIsDropdownOpen(true);
        setHighlightedIndex(filteredDestinations.length - 1);
      } else {
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredDestinations.length - 1
        );
      }
    } else if (e.key === 'Enter') {
      if (isDropdownOpen && highlightedIndex >= 0 && filteredDestinations[highlightedIndex]) {
        e.preventDefault();
        setDestination(filteredDestinations[highlightedIndex]);
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
      }
      // If dropdown is closed, Enter naturally submits the form!
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleSelectDestination = (city) => {
    setDestination(city);
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  // Date handlers with automatic cleanup and validation
  const handleCheckInChange = (newCheckIn) => {
    setCheckIn(newCheckIn);
    const today = getTodayLocalDate();

    if (newCheckIn && newCheckIn < today) {
      setDateError("Check-in date cannot be in the past.");
    } else {
      setDateError("");
    }

    // If check-in moves to or past current check-out, reset check-out
    if (checkOut && newCheckIn && checkOut <= newCheckIn) {
      setCheckOut("");
    }
  };

  const handleCheckOutChange = (newCheckOut) => {
    setCheckOut(newCheckOut);
    if (checkIn && newCheckOut && newCheckOut <= checkIn) {
      setDateError("Check-out date must be strictly after check-in date.");
    } else {
      setDateError("");
    }
  };

  const onSearch = async (e) => {
    e.preventDefault();

    if (!destination || !destination.trim()) {
      toast.error("Please enter or select a destination");
      return;
    }

    const today = getTodayLocalDate();
    if (checkIn) {
      if (checkIn < today) {
        setDateError("Check-in date cannot be in the past.");
        toast.error("Check-in date cannot be in the past.");
        return;
      }
      if (!checkOut) {
        setDateError("Please select a check-out date.");
        toast.error("Please select a check-out date.");
        return;
      }
      if (checkOut <= checkIn) {
        setDateError("Check-out date must be strictly after check-in date.");
        toast.error("Check-out date must be strictly after check-in date.");
        return;
      }
    } else if (checkOut) {
      setDateError("Please select a check-in date.");
      toast.error("Please select a check-in date.");
      return;
    }

    const parsedGuests = Number(guests);
    if (!parsedGuests || isNaN(parsedGuests) || parsedGuests < 1 || !Number.isInteger(parsedGuests)) {
      toast.error("Guest count must be a positive integer.");
      return;
    }

    setDateError("");
    const selectedCity = destination.trim();

    // Construct query parameters
    const query = new URLSearchParams();
    query.set('city', selectedCity);
    if (checkIn) query.set('checkIn', checkIn);
    if (checkOut) query.set('checkOut', checkOut);
    if (guests) query.set('guests', parsedGuests);

    navigate(`/rooms?${query.toString()}`);

    // Call API to save recent searched city if authenticated
    try {
      const token = await getToken();
      if (token) {
        await axios.post(
          'api/user/store-recent-search',
          { recentSearchedCity: selectedCity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (err) {
      // Non-blocking
    }

    // Add destination to searchedCities (max 3)
    setSearchedCities((prev) => {
      const updated = [...prev, selectedCity];
      if (updated.length > 3) updated.shift();
      return updated;
    });
  };

  return (
    <div className='flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 xl:px-32 text-white bg-[url("/src/assets/heroImage.png")] bg-no-repeat bg-cover bg-center h-screen'>
      <p className='bg-[#49B9FF]/50 px-3.5 py-1 rounded-full mt-20'>The Ultimate Hotel Experience</p>
      <h1 className='font-playfair text-2xl md:text-5xl lg:text-5xl md:text-[56px] md:leading-13.5 font-bold md:font-extrabold max-w-xl mt-4'>Discover your perfect Gateway Destination</h1>
      <p className='max-w-130 mt-2 text-sm md:text-base'>Unparalleled luxury and comfort await at the world's most exclusive hotels and resorts. Start your journey today.</p>

      <form onSubmit={onSearch} className='bg-white text-gray-500 rounded-lg px-6 py-4 mt-8 flex flex-col md:flex-row max-md:items-start gap-4 max-md:mx-auto csffv relative'>
        
        {/* Destination with Autocomplete */}
        <div ref={autocompleteRef} className='relative w-full md:w-auto'>
          <div className='flex items-center gap-2'>
            <img src={assets.locationIcon} alt='' className='h-4 opacity-70' />
            <label htmlFor='destinationInput' className='text-sm font-medium text-gray-700'>Destination</label>
          </div>
          <input
            ref={inputRef}
            id='destinationInput'
            type='text'
            autoComplete='off'
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              setIsDropdownOpen(true);
              setHighlightedIndex(0);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            onKeyDown={handleDestinationKeyDown}
            className='rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none w-full md:w-44 focus:border-black transition-colors'
            placeholder='Type or select city'
            required
          />

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              className='absolute left-0 top-full mt-1.5 w-full md:w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-56 overflow-y-auto'
            >
              {loadingDestinations ? (
                <div className='px-4 py-3 text-xs text-gray-400 flex items-center gap-2'>
                  <span className='animate-spin inline-block w-3 h-3 border-2 border-gray-300 border-t-black rounded-full'></span>
                  Loading destinations...
                </div>
              ) : filteredDestinations.length === 0 ? (
                <div className='px-4 py-3 text-xs text-gray-500 italic'>
                  No destinations found
                </div>
              ) : (
                <ul className='py-1'>
                  {filteredDestinations.map((city, index) => (
                    <li
                      key={city}
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevents input blur before selection
                        handleSelectDestination(city);
                      }}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`autocomplete-item px-3.5 py-2 text-sm cursor-pointer flex items-center gap-2.5 transition-colors ${
                        index === highlightedIndex
                          ? 'bg-gray-100 text-gray-900 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <img src={assets.locationIcon} alt="" className="h-3.5 opacity-50" />
                      <span>{city}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Check-In */}
        <div className='w-full md:w-auto'>
          <div className='flex items-center gap-2'>
            <img src={assets.calenderIcon} alt='' className='h-4' />
            <label htmlFor='checkIn' className='text-sm font-medium text-gray-700'>Check in</label>
          </div>
          <input
            id='checkIn'
            type='date'
            value={checkIn}
            min={getTodayLocalDate()}
            onChange={(e) => handleCheckInChange(e.target.value)}
            className='rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none w-full md:w-36 focus:border-black transition-colors'
          />
        </div>

        {/* Check-Out */}
        <div className='w-full md:w-auto'>
          <div className='flex items-center gap-2'>
            <img src={assets.calenderIcon} alt='' className='h-4' />
            <label htmlFor='checkOut' className='text-sm font-medium text-gray-700'>Check out</label>
          </div>
          <input
            id='checkOut'
            type='date'
            value={checkOut}
            min={checkIn ? getNextLocalDate(checkIn) : getNextLocalDate(getTodayLocalDate())}
            disabled={!checkIn}
            onChange={(e) => handleCheckOutChange(e.target.value)}
            className='rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none w-full md:w-36 focus:border-black transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed'
          />
        </div>

        {/* Guests */}
        <div className='flex md:flex-col max-md:gap-2 max-md:items-center w-full md:w-auto'>
          <label htmlFor='guests' className='text-sm font-medium text-gray-700'>Guests</label>
          <input
            min={1}
            max={20}
            id='guests'
            type='number'
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className='rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none w-full md:w-16 focus:border-black transition-colors'
            placeholder='1'
            required
          />
        </div>

        {/* Search Button */}
        <button
          type='submit'
          className='flex items-center justify-center gap-1 rounded-md bg-black py-3 px-4 text-white my-auto cursor-pointer max-md:w-full max-md:py-2.5 hover:bg-gray-800 transition-colors'
        >
          <img src={assets.searchIcon} alt='searchIcon' className='h-6' />
          <span>Search</span>
        </button>

        {/* Inline Date Validation Error */}
        {dateError && (
          <div className='absolute -bottom-7 left-2 text-xs font-semibold text-rose-300 bg-black/80 px-2.5 py-0.5 rounded shadow'>
            ⚠️ {dateError}
          </div>
        )}
      </form>
    </div>
  )
}

export default Hero
