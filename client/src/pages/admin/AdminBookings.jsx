import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';

const AdminBookings = () => {
    const { axios, getToken, currency } = useAppContext();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/admin/bookings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setBookings(data.bookings);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    if (loading && bookings.length === 0) return (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
    );

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Booking Management</h1>
                <p className="text-sm text-gray-500 mt-1">View all platform bookings (Read-only view).</p>
            </div>

            <div className="bg-white border rounded-xl shadow-sm overflow-hidden relative">
                {bookings.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No bookings found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50/50 border-b">
                                <tr>
                                    <th className="px-6 py-3 font-medium text-gray-500">Booking ID</th>
                                    <th className="px-6 py-3 font-medium text-gray-500">Customer</th>
                                    <th className="px-6 py-3 font-medium text-gray-500">Hotel</th>
                                    <th className="px-6 py-3 font-medium text-gray-500">Room</th>
                                    <th className="px-6 py-3 font-medium text-gray-500">Check-in / Out</th>
                                    <th className="px-6 py-3 font-medium text-gray-500">Amount</th>
                                    <th className="px-6 py-3 font-medium text-gray-500">Payment</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {bookings.map(booking => (
                                    <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">{booking._id.slice(-8)}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{booking.user?.username || 'Unknown'}</td>
                                        <td className="px-6 py-4 text-gray-600">{booking.hotel?.name || 'Deleted Hotel'}</td>
                                        <td className="px-6 py-4 text-gray-600">{booking.room?.roomType || 'Deleted Room'}</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {new Date(booking.checkInDate).toLocaleDateString()} <br />
                                            <span className="text-xs text-gray-400">to</span> {new Date(booking.checkOutDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{currency} {booking.totalPrice}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                booking.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {booking.isPaid ? 'Paid' : 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBookings;
