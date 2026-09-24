import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';

const AdminHotels = () => {
    const { axios, getToken } = useAppContext();
    const [searchParams, setSearchParams] = useSearchParams();

    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const statusFilter = searchParams.get('filter') || 'all';
    const [actionLoading, setActionLoading] = useState(false);

    const fetchHotels = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/admin/hotels', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setHotels(data.hotels);
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
        fetchHotels();
    }, []);

    const handleAction = async (id, action) => {
        try {
            let body = {};
            
            if (action === 'approve') {
                if (!window.confirm("Approve this hotel?")) return;
            } else if (action === 'reject') {
                const reason = window.prompt("Reason for rejection:");
                if (reason === null) return;
                if (!reason.trim()) {
                    return toast.error("A rejection reason is required.");
                }
                body = { reason };
            } else if (action === 'suspend') {
                const reason = window.prompt("Reason for suspension:");
                if (reason === null) return;
                body = { reason };
            } else if (action === 'reactivate') {
                if (!window.confirm("Reactivate this hotel?")) return;
            } else if (action === 'delete') {
                if (!window.confirm("This permanently removes the hotel. This action cannot be undone. Are you sure?")) return;
                
                setActionLoading(true);
                const token = await getToken();
                const { data } = await axios.delete(`/api/admin/hotels/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setActionLoading(false);
                
                if (data.success) {
                    toast.success(data.message);
                    fetchHotels();
                } else {
                    toast.error(data.message);
                }
                return;
            }

            setActionLoading(true);
            const token = await getToken();
            const { data } = await axios.put(`/api/admin/hotels/${id}/${action}`, body, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setActionLoading(false);

            if (data.success) {
                toast.success(`Hotel ${action}d successfully.`);
                // We update local state to avoid full refetch for small changes, or just refetch
                fetchHotels();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            setActionLoading(false);
            toast.error(error.message);
        }
    };

    const filteredHotels = hotels.filter(hotel => {
        // Status filter
        if (statusFilter !== 'all' && hotel.status !== statusFilter) return false;
        
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const nameMatch = hotel.name.toLowerCase().includes(query);
            const cityMatch = hotel.city.toLowerCase().includes(query);
            const ownerMatch = hotel.owner?.username?.toLowerCase().includes(query);
            return nameMatch || cityMatch || ownerMatch;
        }
        return true;
    });

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            approved: 'bg-green-100 text-green-800 border-green-200',
            rejected: 'bg-red-100 text-red-800 border-red-200',
            suspended: 'bg-orange-100 text-orange-800 border-orange-200'
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${styles[status]}`}>
                {status}
            </span>
        );
    };

    if (loading && hotels.length === 0) return (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Hotel Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage platform hotels and approvals.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                        type="text" 
                        placeholder="Search hotel, city or owner..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black w-full sm:w-64"
                    />
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setSearchParams({ filter: e.target.value })}
                        className="border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black bg-white"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="suspended">Suspended</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="bg-white border rounded-xl shadow-sm overflow-hidden relative">
                {actionLoading && (
                    <div className="absolute inset-0 bg-white/50 flex justify-center pt-10 z-10">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                    </div>
                )}
                
                {filteredHotels.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        {searchQuery || statusFilter !== 'all' ? 'No hotels match your search.' : 'No hotels found.'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50/50 border-b">
                                <tr>
                                    <th className="px-6 py-3 font-medium text-gray-500">Hotel</th>
                                    <th className="px-6 py-3 font-medium text-gray-500">Owner</th>
                                    <th className="px-6 py-3 font-medium text-gray-500">City</th>
                                    <th className="px-6 py-3 font-medium text-gray-500">Status</th>
                                    <th className="px-6 py-3 font-medium text-gray-500">Created</th>
                                    <th className="px-6 py-3 font-medium text-gray-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredHotels.map(hotel => (
                                    <tr key={hotel._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{hotel.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{hotel.owner?.username || 'Unknown'}</td>
                                        <td className="px-6 py-4 text-gray-600">{hotel.city}</td>
                                        <td className="px-6 py-4">{getStatusBadge(hotel.status)}</td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(hotel.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {hotel.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => handleAction(hotel._id, 'approve')} className="text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1 rounded transition-colors font-medium">Approve</button>
                                                        <button onClick={() => handleAction(hotel._id, 'reject')} className="text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors font-medium">Reject</button>
                                                    </>
                                                )}
                                                {hotel.status === 'approved' && (
                                                    <button onClick={() => handleAction(hotel._id, 'suspend')} className="text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded transition-colors font-medium">Suspend</button>
                                                )}
                                                {(hotel.status === 'suspended' || hotel.status === 'rejected') && (
                                                    <button onClick={() => handleAction(hotel._id, 'reactivate')} className="text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors font-medium">Reactivate</button>
                                                )}
                                                
                                                <Link to={`/admin/hotels/${hotel._id}`} className="text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors font-medium ml-2">
                                                    View
                                                </Link>
                                            </div>
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

export default AdminHotels;
