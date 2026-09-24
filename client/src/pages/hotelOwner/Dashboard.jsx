import React, { useState, useEffect } from 'react'
import Title from '../../components/Title'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import { toast } from 'react-hot-toast'

const Dashboard = () => {
    const { currency, user, getToken, axios } = useAppContext()
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
                            onClick={() => window.location.href='/owner/edit-hotel'}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                        >
                            Edit Hotel
                        </button>
                    </div>
                </div>
            )}
            <div className='flex gap-4 my-8'>
                {/* ---- ---Total Bookings -- */}
                <div className='bg-primary/3 border border-primary/10 rounded flex p-4 pr-8'>
                    <img src={assets.totalBookingIcon} alt="" className='max-sm:hidden h-10' />
                    <div className='flex flex-col sm:ml-4 font-medium'>
                        <p className='text-blue-500 text-lg'>Total Bookings</p>
                        <p className='text-neutral-400 text-base'>{dashboardData.totalBookings}</p>
                    </div>
                </div>
                {/* ---- ---Total Revenue -- */}
                <div className='bg-primary/3 border border-primary/10 rounded flex p-4 pr-8'>
                    <img src={assets.totalRevenueIcon} alt="" className='max-sm:hidden h-10' />
                    <div className='flex flex-col sm:ml-4 font-medium'>
                        <p className='text-blue-500 text-lg'>Total Revenue</p>
                        <p className='text-neutral-400 text-base'>{currency} {dashboardData.totalRevenue.toFixed(2)}</p>
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
                                    <button className={`py-1 px-3 text-xs rounded-full mx-auto ${item.isPaid ? 'bg-green-200 text-green-600' : 'bg-amber-200 text-yellow-600'}`}>
                                        {item.isPaid ? 'Completed' : 'Pending'}
                                    </button>
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