import React, { useState } from 'react';
import { assets, cities } from '../assets/assets'; // Added cities import
import { useAppContext } from '../context/AppContext';
import { useAuth, useUser, useClerk } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';

const HotelReg = () => {

    const { setShowHotelReg, axios, setIsOwner, fetchUser } = useAppContext();
    const { getToken, isSignedIn } = useAuth();
    const { user } = useUser();
    const { openSignIn } = useClerk();
     
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [contact, setContact] = useState("");
    const [city, setCity] = useState("");

    const onSubmitHandler = async (event) => {
        try {
            event.preventDefault();

            if (!isSignedIn || !user) {
                toast.error("Please log in first to register your hotel");
                setShowHotelReg(false);
                openSignIn({});
                return;
            }

            const token = await getToken();

            if (!token) {
                toast.error("Session expired. Please log in again.");
                setShowHotelReg(false);
                openSignIn({});
                return;
            }

            const { data } = await axios.post(
                `/api/hotels`, 
                { name, contact, address, city },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                toast.success(data.message);
                setIsOwner(true);
                setShowHotelReg(false);
                if (fetchUser) {
                    await fetchUser();
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div 
            className='fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm'
            onClick={() => setShowHotelReg(false)}
        >
            <form onSubmit={onSubmitHandler}
                className='flex bg-white rounded-xl max-w-4xl max-md:mx-2 overflow-hidden shadow-2xl relative'
                onClick={(e) => e.stopPropagation()}
            >
                <img 
                    src={assets.regImage} 
                    alt="reg-image" 
                    className='w-1/2 rounded-l-xl hidden md:block object-cover'
                />

                <div className='relative flex flex-col items-center md:w-1/2 p-8 md:p-10'>
                    <img 
                        src={assets.closeIcon} 
                        alt="close-icon" 
                        className='absolute top-4 right-4 h-4 w-4 cursor-pointer hover:opacity-80' 
                        onClick={() => setShowHotelReg(false)}
                    />
                    <p className='text-2xl font-bold mt-4 text-gray-900'>Register Your Hotel</p>
                    
                    {/* Hotel Name */}
                    <div className='w-full mt-4'>
                        <label htmlFor="name" className="text-sm font-medium text-gray-600 block text-left">
                            Hotel Name
                        </label>
                        <input 
                            id='name' 
                            onChange={(e)=> setName(e.target.value)} value = {name}
                            type="text" 
                            placeholder="Type here" 
                            className="border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light text-sm" 
                            required
                        />
                    </div>

                    {/* Phone */}
                    <div className='w-full mt-4'>
                        <label htmlFor="contact" className="text-sm font-medium text-gray-600 block text-left">
                            Phone
                        </label>
                        <input 
                            onChange={(e)=> setContact(e.target.value)} value={contact}
                            id='contact' 
                            type="text" 
                            placeholder="Type here" 
                            className="border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light text-sm" 
                            required
                        />
                    </div>

                    {/* Address */}
                    <div className='w-full mt-4'>
                        <label htmlFor="address" className="text-sm font-medium text-gray-600 block text-left">
                            Address
                        </label>
                        <input 
                            onChange={(e)=> setAddress(e.target.value)} value={address}
                            id='address' 
                            type="text" 
                            placeholder="Type here" 
                            className="border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light text-sm" 
                            required
                        />
                    </div>

                    {/* Select City Drop Down*/}
                    <div className='w-full mt-4 max-w-60 mr-auto'>
                        <label htmlFor="city" className="text-sm font-medium text-gray-600 block text-left">
                            City
                        </label>
                        <select 
                            onChange={(e)=> setCity(e.target.value)} value = {city}
                            id="city" 
                            className='border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light text-sm text-gray-600' 
                            required
                        >
                            <option value="">Select City</option>
                            {cities?.map((city) => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                    <button 
                        type="submit"
                        className='bg-indigo-600 hover:bg-indigo-700 transition-all text-white mr-auto px-6 py-2 rounded cursor-pointer mt-6 font-medium text-sm'
                    >
                        Register
                    </button>
                </div>
            </form>
        </div>
    );
};

export default HotelReg