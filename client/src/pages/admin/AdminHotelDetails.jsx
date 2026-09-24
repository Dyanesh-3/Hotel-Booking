import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';

const AdminHotelDetails = () => {
    const { id } = useParams();
    const { axios, getToken } = useAppContext();
    const [hotel, setHotel] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHotel = async () => {
            try {
                const token = await getToken();
                // Fetch hotel details
                const { data } = await axios.get('/api/admin/hotels', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (data.success) {
                    const found = data.hotels.find(h => h._id === id);
                    if (found) {
                        setHotel(found);
                    } else {
                        setError('Hotel not found.');
                    }
                } else {
                    setError(data.message);
                }

                // Fetch history
                const historyRes = await axios.get(`/api/admin/hotels/${id}/history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (historyRes.data.success) {
                    setHistory(historyRes.data.history);
                }

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHotel();
    }, [id, axios, getToken]);

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
    );

    if (error || !hotel) return (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error || 'Hotel not found.'}
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <Link to="/admin/hotels" className="text-sm text-gray-500 hover:text-black mb-2 inline-block">← Back to Hotels</Link>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{hotel.name}</h1>
                </div>
                <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border capitalize ${
                        hotel.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        hotel.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                        hotel.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                        'bg-orange-100 text-orange-800 border-orange-200'
                    }`}>
                        {hotel.status}
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Hotel Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500 mb-1">Hotel ID</p>
                            <p className="font-medium text-gray-900 font-mono">{hotel._id}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 mb-1">Created At</p>
                            <p className="font-medium text-gray-900">{new Date(hotel.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 mb-1">Address</p>
                            <p className="font-medium text-gray-900">{hotel.address}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 mb-1">City</p>
                            <p className="font-medium text-gray-900">{hotel.city}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 mb-1">Contact</p>
                            <p className="font-medium text-gray-900">{hotel.contact}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-b bg-gray-50/50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Owner Information</h3>
                    <div className="flex items-center gap-4">
                        <img src={hotel.owner?.image || 'https://placehold.co/100x100'} alt="Owner" className="w-12 h-12 rounded-full border bg-white" />
                        <div>
                            <p className="font-medium text-gray-900">{hotel.owner?.username || 'Unknown User'}</p>
                            <p className="text-sm text-gray-500">{hotel.owner?.email || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {(hotel.rejectionReason || hotel.suspensionReason) && (
                    <div className="p-6 border-b">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Notes</h3>
                        {hotel.rejectionReason && (
                            <div className="mb-3">
                                <p className="text-sm text-gray-500 mb-1">Rejection Reason</p>
                                <p className="text-sm text-red-700 bg-red-50 p-3 rounded border border-red-100">{hotel.rejectionReason}</p>
                            </div>
                        )}
                        {hotel.suspensionReason && (
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Suspension Reason</p>
                                <p className="text-sm text-orange-700 bg-orange-50 p-3 rounded border border-orange-100">{hotel.suspensionReason}</p>
                            </div>
                        )}
                    </div>
                )}

                {history && history.length > 0 && (
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Action History</h3>
                        <div className="space-y-4">
                            {history.map((item, index) => (
                                <div key={index} className="flex gap-4 items-start">
                                    <div className="mt-1">
                                        <span className={`inline-block w-2 h-2 rounded-full ${
                                            item.action === 'created' ? 'bg-blue-500' :
                                            item.action === 'approved' ? 'bg-green-500' :
                                            item.action === 'rejected' ? 'bg-red-500' :
                                            item.action === 'suspended' ? 'bg-orange-500' :
                                            item.action === 'reactivated' ? 'bg-green-400' :
                                            item.action === 'resubmitted' ? 'bg-yellow-500' :
                                            'bg-gray-500'
                                        }`}></span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium capitalize text-gray-900">
                                            {item.action} 
                                            <span className="font-normal text-gray-500 text-xs ml-2">
                                                {new Date(item.createdAt).toLocaleString()} by {item.user?.username || 'Unknown'} ({item.user?.role || 'System'})
                                            </span>
                                        </p>
                                        {item.reason && <p className="text-sm text-gray-600 mt-1">{item.reason}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminHotelDetails;
