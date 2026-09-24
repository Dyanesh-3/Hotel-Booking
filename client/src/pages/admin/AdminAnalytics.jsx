import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';

const AdminAnalytics = () => {
    const { axios, getToken, currency } = useAppContext();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = await getToken();
                
                const statsRes = await axios.get('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } });
                if (statsRes.data.success) {
                    setStats(statsRes.data.stats);
                } else {
                    setError(statsRes.data.message);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [axios, getToken]);

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
    );
    
    if (error || !stats) return (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            Something went wrong while loading analytics. Please try again.
        </div>
    );

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Platform Analytics</h1>
                <p className="text-gray-500 mt-1">Detailed breakdown of platform statistics and revenue.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Demographics</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-gray-600">Total Users</span>
                            <span className="font-bold text-gray-900">{stats.totalUsers}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-gray-600">Hotel Owners</span>
                            <span className="font-bold text-gray-900">{stats.totalHotelOwners}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Standard Customers</span>
                            <span className="font-bold text-gray-900">{stats.totalUsers - stats.totalHotelOwners}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Hotel Statistics</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-gray-600">Total Hotels</span>
                            <span className="font-bold text-gray-900">{stats.totalHotels}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-yellow-600 font-medium">Pending Approvals</span>
                            <span className="font-bold text-yellow-700">{stats.pendingHotels}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-green-600 font-medium">Approved & Active</span>
                            <span className="font-bold text-green-700">{stats.approvedHotels}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-orange-600 font-medium">Suspended</span>
                            <span className="font-bold text-orange-700">{stats.suspendedHotels}</span>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border p-6 md:col-span-2 flex flex-col justify-center items-center py-12">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Platform Bookings</h3>
                    <p className="text-4xl font-bold text-blue-600 mb-2">{stats.totalBookings}</p>
                    <p className="text-gray-500 mb-6">Total successful bookings across all hotels</p>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Processed Value</h3>
                    <p className="text-4xl font-bold text-green-600 mb-2">{currency} {stats.totalRevenue.toLocaleString()}</p>
                    <p className="text-gray-500">Gross revenue before commissions or payouts</p>
                    
                    <div className="mt-8 text-sm text-gray-400 italic text-center">
                        Note: Advanced charts and time-series analytics are scheduled for a future phase.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
