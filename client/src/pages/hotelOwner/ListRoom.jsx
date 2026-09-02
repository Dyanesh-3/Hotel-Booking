import React, { useState, useEffect } from 'react'
import Title from '../../components/Title'
import { useAppContext } from '../../context/AppContext'
import { toast } from 'react-hot-toast'

const ListRoom = () => {

    const [rooms, setRooms] = useState([])
    const { axios, getToken, user } = useAppContext()

    // Fetch Rooms of the Hotel Owner
    const fetchRooms = async () => {
        try {
            const token = await getToken()
            if (!token) return

            const { data } = await axios.get('/api/room/owner', { 
                headers: { Authorization: `Bearer ${token}` } 
            })
            
            if (data.success){
                setRooms(data.rooms || [])
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Toggle Availability of the Room
    const toggleAvailability = async (roomId) => {
        try {
            const token = await getToken()
            if (!token) return

            const { data } = await axios.post('/api/room/toggle-availability', 
                { roomId },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            
            if (data.success) {
                toast.success(data.message)
                fetchRooms()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    useEffect(() => {
        if (user) {
            fetchRooms()
        }
    }, [user])
    
    return (
        <div>
            <Title align='left' font='outfit' title='Room Listings' subTitle='View, edit, or manage all listed rooms. Keep the information up-to-date to provide the best experience for users.' />
            <p className='text-gray-500 mt-8'>All Rooms</p>

            <div className='w-full max-w-3xl text-left border border-gray-300 rounded-lg max-h-80 overflow-y-scroll mt-3'>
                <table className='w-full'>
                    <thead className='bg-gray-50'>
                        <tr>
                            <th className='py-3 px-4 text-gray-800 font-medium'>Name</th>
                            <th className='py-3 px-4 text-gray-800 font-medium max-sm:hidden'>Facility</th>
                            <th className='py-3 px-4 text-gray-800 font-medium'>Price / night</th>
                            <th className='py-3 px-4 text-gray-800 font-medium text-center'>Actions</th>
                        </tr>
                    </thead>
                    <tbody className='text-sm'>
                        {rooms.length === 0 ? (
                            <tr>
                                <td colSpan="4" className='py-8 text-center text-gray-500'>
                                    No rooms found. Add a room to get started.
                                </td>
                            </tr>
                        ) : (
                            rooms.map((item, index) => (
                                <tr key={item._id || index}>
                                    <td className='py-3 px-4 text-gray-700 border-t border-gray-300 font-medium'>
                                        {item.roomType}
                                    </td>
                                    <td className='py-3 px-4 text-gray-700 border-t border-gray-300 max-sm:hidden'>
                                        {Array.isArray(item.amenities) ? item.amenities.join(', ') : item.amenities}
                                    </td>
                                    <td className='py-3 px-4 text-gray-700 border-t border-gray-300'>
                                        {currency} {item.pricePerNight}
                                    </td>
                                    <td className='py-3 px-4 border-t border-gray-300 text-center'>
                                        <label className='relative inline-flex items-center cursor-pointer'>
                                            <input 
                                                type="checkbox" 
                                                className='sr-only peer' 
                                                checked={item.isAvailable}
                                                onChange={()=>toggleAvailability(item._id)}/>
                                            <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-200"></div>
                                            <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                                        </label>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ListRoom