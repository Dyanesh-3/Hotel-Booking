import React, { useState, useEffect } from 'react'
import Title from '../../components/Title'
import { useAppContext } from '../../context/AppContext'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const EditHotel = () => {
    const { getToken, axios, user } = useAppContext()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [hotel, setHotel] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        contact: '',
        city: ''
    })

    useEffect(() => {
        if (user) {
            fetchHotelDetails()
        }
    }, [user])

    const fetchHotelDetails = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/hotels/my-hotel', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                setHotel(data.hotel)
                setFormData({
                    name: data.hotel.name || '',
                    address: data.hotel.address || '',
                    contact: data.hotel.contact || '',
                    city: data.hotel.city || ''
                })
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const token = await getToken()
            const { data } = await axios.put(`/api/hotels/${hotel._id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                toast.success('Hotel updated successfully')
                fetchHotelDetails()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleResubmit = async () => {
        setSubmitting(true)
        try {
            const token = await getToken()
            const { data } = await axios.put(`/api/hotels/${hotel._id}/resubmit`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                toast.success('Hotel resubmitted successfully for approval')
                navigate('/owner')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return <div className="text-center mt-20">Loading hotel details...</div>
    }

    if (!hotel) {
        return <div className="text-center mt-20 text-red-500">No hotel found. Please register first.</div>
    }

    return (
        <div>
            <Title align='left' font='outfit' title='Edit Hotel' subTitle='Update your hotel details.' />

            {hotel.status === 'rejected' && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded mb-6">
                    <p className="font-semibold">🔴 Your hotel was rejected</p>
                    <p className="mt-1">Reason: {hotel.rejectionReason}</p>
                    <p className="mt-2 text-sm">Please update the necessary details below and click Resubmit for Approval.</p>
                </div>
            )}
            
            {hotel.status === 'suspended' && (
                <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded mb-6">
                    <p className="font-semibold">🔴 Your hotel is suspended</p>
                    <p className="mt-1">Reason: {hotel.suspensionReason}</p>
                    <p className="mt-2 text-sm font-semibold">You cannot edit a suspended hotel. Contact an administrator to resolve the suspension.</p>
                </div>
            )}

            <form onSubmit={handleUpdate} className='max-w-2xl bg-white border border-gray-200 p-6 rounded-lg'>
                <div className='mb-4'>
                    <label className='block text-gray-700 text-sm font-bold mb-2'>Hotel Name</label>
                    <input 
                        type='text' 
                        name='name'
                        value={formData.name}
                        onChange={handleChange}
                        className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700' 
                        required
                        disabled={hotel.status === 'suspended'}
                    />
                </div>
                <div className='mb-4'>
                    <label className='block text-gray-700 text-sm font-bold mb-2'>City</label>
                    <input 
                        type='text' 
                        name='city'
                        value={formData.city}
                        onChange={handleChange}
                        className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700' 
                        required
                        disabled={hotel.status === 'suspended'}
                    />
                </div>
                <div className='mb-4'>
                    <label className='block text-gray-700 text-sm font-bold mb-2'>Address</label>
                    <textarea 
                        name='address'
                        value={formData.address}
                        onChange={handleChange}
                        className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 h-24' 
                        required
                        disabled={hotel.status === 'suspended'}
                    ></textarea>
                </div>
                <div className='mb-6'>
                    <label className='block text-gray-700 text-sm font-bold mb-2'>Contact Email / Phone</label>
                    <input 
                        type='text' 
                        name='contact'
                        value={formData.contact}
                        onChange={handleChange}
                        className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700' 
                        required
                        disabled={hotel.status === 'suspended'}
                    />
                </div>

                <div className='flex gap-4'>
                    <button 
                        type="submit" 
                        disabled={submitting || hotel.status === 'suspended'}
                        className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline disabled:opacity-50'
                    >
                        {submitting ? 'Saving...' : 'Save Changes'}
                    </button>

                    {hotel.status === 'rejected' && (
                        <button 
                            type="button" 
                            onClick={handleResubmit}
                            disabled={submitting}
                            className='bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline disabled:opacity-50'
                        >
                            Resubmit for Approval
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}

export default EditHotel
