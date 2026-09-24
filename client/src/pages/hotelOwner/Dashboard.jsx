import React, { useState, useEffect } from 'react'
import Title from '../../components/Title'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import { toast } from 'react-hot-toast'

const Dashboard = () => {
    const { currency, user, getToken, axios, navigate } = useAppContext()
    const [dashboardData, setDashboardData] = useState({
        bookings: [],
        totalBookings: 0,
        totalRevenue: 0
    })

    const fetchDashboardData = async ()=>{
        try {
            const token = await getToken()
            if (!token) return

            const { data } = await axios.get('/api/bookings/hotel', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if(data.success){
                setDashboardData(data.dashboardData || { bookings: [], totalBookings: 0, totalRevenue: 0 });
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    useEffect(()=>{
        if(user) {
            fetchDashboardData()
        }
    }, [user]);
    return (
        <div>
            <Title align='left' font='outfit' title='Dashboard' subTitle='Monitor your room listings, track bookings ans analyze revenue-all in one place. Stay updated with real-time insights to ensure smooth operations.' />
            
            {/* Status Banner */}
            {dashboardData.status && (
                <div className={`p-4 mb-6 rounded border ${
                    dashboardData.status === 'pending' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                    dashboardData.status === 'approved' ? 'bg-green-50 border-green-200 text-green-800' :
                    dashboardData.status === 'rejected' ? 'bg-red-50 border-red-200 text-red-800' :
                    'bg-orange-50 border-orange-200 text-orange-800'
                }`}>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold capitalize">{
                            dashboardData.status === 'pending' ? '🟡 Pending Approval' :
                            dashboardData.status === 'approved' ? '🟢 Approved' :
                            dashboardData.status === 'rejected' ? '🔴 Rejected' :
                            '🔴 Suspended'
                        }</span>
                    </div>
                    <p className="mt-1 text-sm">
                        {dashboardData.status === 'pending' && "Your hotel has been submitted and is waiting for administrator approval."}
                        {dashboardData.status === 'approved' && "Your hotel is currently visible to customers."}
                        {dashboardData.status === 'rejected' && `Rejection Reason: ${dashboardData.rejectionReason || 'No reason provided.'}`}
                        {dashboardData.status === 'suspended' && `Suspension Reason: ${dashboardData.suspensionReason || 'No reason provided.'}`}
                    </p>
                    <div className="mt-4">
                        <button 
                            onClick={() => navigate('/owner/edit-hotel')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                        >
                            Edit Hotel
                        </button>
                    </div>
                </div>
            )}
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 my-8'>
                {/* ---- ---Total Rooms -- */}
                <div className='bg-primary/3 border border-primary/10 rounded flex p-4'>
                    <div className='flex flex-col font-medium'>
                        <p className='text-blue-500 text-sm'>Total Rooms</p>
                        <p className='text-neutral-600 text-xl font-bold'>{dashboardData.totalRooms || 0}</p>
                    </div>
                </div>
                {/* ---- ---Available Rooms -- */}
                <div className='bg-green-50 border border-green-200 rounded flex p-4'>
                    <div className='flex flex-col font-medium'>
                        <p className='text-green-600 text-sm'>Available Rooms</p>
                        <p className='text-neutral-600 text-xl font-bold'>{dashboardData.availableRooms || 0}</p>
                    </div>
                </div>
                {/* ---- ---Total Bookings -- */}
                <div className='bg-primary/3 border border-primary/10 rounded flex p-4'>
                    <div className='flex flex-col font-medium'>
                        <p className='text-blue-500 text-sm'>Total Bookings</p>
                        <p className='text-neutral-600 text-xl font-bold'>{dashboardData.totalBookings || 0}</p>
                    </div>
                </div>
                {/* ---- ---Upcoming Bookings -- */}
                <div className='bg-purple-50 border border-purple-200 rounded flex p-4'>
                    <div className='flex flex-col font-medium'>
                        <p className='text-purple-600 text-sm'>Upcoming Bookings</p>
                        <p className='text-neutral-600 text-xl font-bold'>{dashboardData.upcomingBookings || 0}</p>
                    </div>
                </div>
                {/* ---- ---Total Revenue -- */}
                <div className='bg-primary/3 border border-primary/10 rounded flex p-4'>
                    <div className='flex flex-col font-medium'>
                        <p className='text-blue-500 text-sm'>Expected Revenue</p>
                        <p className='text-neutral-600 text-xl font-bold'>{currency} {(dashboardData.totalRevenue || 0).toFixed(2)}</p>
                    </div>
                </div>
                {/* ---- ---Paid Revenue -- */}
                <div className='bg-green-50 border border-green-200 rounded flex p-4'>
                    <div className='flex flex-col font-medium'>
                        <p className='text-green-600 text-sm'>Paid Revenue</p>
                        <p className='text-neutral-600 text-xl font-bold'>{currency} {(dashboardData.totalPaidRevenue || 0).toFixed(2)}</p>
                    </div>
                </div>
            </div>
            {/* ---- ---Recent Bookings -- */}
            <h2 className='text-xl text-blue-950/70 font-medium mb-5'>Recent Bookings</h2>
            <div className='w-full max-w-3xl text-left border border-gray-300 rounded-lg max-h-80 overflow-y-scroll'>
                <table className='w-full'>
                    <thead className='bg-gray-50'>
                        <tr>
                            <th className='py-3 px-4 text-gray-800 font-medium'>User Name</th>
                            <th className='py-3 px-4 text-gray-800 font-medium max-sm:hidden'>Room Name</th>
                            <th className='py-3 px-4 text-gray-800 font-medium text-center'>Total Amount</th>
                            <th className='py-3 px-4 text-gray-800 font-medium text-center'>Booking Status</th>
                            <th className='py-3 px-4 text-gray-800 font-medium text-center'>Payment status</th>
                        </tr>
                    </thead>
                    <tbody className='text-sm'>
                        {dashboardData.bookings.map((item, index) => (
                            <tr key={index} className='border-b border-gray-300'>
                                <td className='py-3 px-4 text-gray-700'>
                                    {item.user.username}
                                </td>
                                <td className='py-3 px-4 text-gray-700'>
                                    {item.room.roomType}
                                </td>
                                <td className='py-3 px-4 text-gray-700 text-center'>
                                    {currency} {item.totalPrice}

                                </td>
                                <td className='py-3 px-4 text-center'>
                                    <span className={`py-1 px-3 text-xs uppercase font-medium rounded-full mx-auto ${
                                        item.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                        item.status === 'completed' ? 'bg-purple-100 text-purple-700' :
                                        item.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className='py-3 px-4 text-center'>
                                    <span className={`py-1 px-3 text-xs uppercase font-medium rounded-full mx-auto ${
                                        item.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 
                                        item.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' :
                                        item.paymentStatus === 'refunded' ? 'bg-gray-100 text-gray-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {item.paymentStatus}
                                    </span>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        </div>
    )
}

export default Dashboard