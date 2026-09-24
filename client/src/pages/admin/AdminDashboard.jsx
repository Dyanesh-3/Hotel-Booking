import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const { axios, getToken } = useAppContext();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pendingHotels, setPendingHotels] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = await getToken();
                
                // Fetch stats
                const statsRes = await axios.get('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } });
                if (statsRes.data.success) {
                    setStats(statsRes.data.stats);
                } else {
                    setError(statsRes.data.message);
                }

                // Fetch pending hotels
                const pendingRes = await axios.get('/api/admin/hotels/pending', { headers: { Authorization: `Bearer ${token}` } });
                if (pendingRes.data.success) {
                    setPendingHotels(pendingRes.data.hotels.slice(0, 5)); // show up to 5
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
    
    if (error) return (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            Something went wrong while loading the data. Please try again. ({error})
        </div>
    );

    const cards = [
        { title: 'Total Users', value: stats.totalUsers },
        { title: 'Total Hotel Owners', value: stats.totalHotelOwners },
        { title: 'Total Hotels', value: stats.totalHotels },
        { title: 'Approved Hotels', value: stats.approvedHotels },
        { title: 'Suspended Hotels', value: stats.suspendedHotels },
        { title: 'Total Bookings', value: stats.totalBookings },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Overview</h1>
                <p className="text-gray-500 mt-1">Welcome back. Here is a summary of the platform.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm border p-5 flex flex-col justify-center">
                        <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">{card.title}</p>
                        <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
                    </div>
                ))}
            </div>

            {/* Pending Approvals Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Pending Hotel Approvals ({stats.pendingHotels})</h2>
                    {pendingHotels.length > 0 && (
                        <Link to="/admin/hotels?filter=pending" className="text-sm text-blue-600 hover:underline font-medium">
                            View All Pending Hotels
                        </Link>
                    )}
                </div>
                
                <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                    {pendingHotels.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No hotels are waiting for approval.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-gray-50/50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 font-medium text-gray-500">Hotel Name</th>
                                        <th className="px-6 py-3 font-medium text-gray-500">City</th>
                                        <th className="px-6 py-3 font-medium text-gray-500">Owner</th>
                                        <th className="px-6 py-3 font-medium text-gray-500 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pendingHotels.map(hotel => (
                                        <tr key={hotel._id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{hotel.name}</td>
                                            <td className="px-6 py-4 text-gray-600">{hotel.city}</td>
                                            <td className="px-6 py-4 text-gray-600">{hotel.owner?.username || 'Unknown'}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Link to={`/admin/hotels/${hotel._id}`} className="text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
                                                    Review
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
