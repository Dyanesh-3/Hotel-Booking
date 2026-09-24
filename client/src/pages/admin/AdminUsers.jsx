import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';

const AdminUsers = () => {
    const { axios, getToken } = useAppContext();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setUsers(data.users);
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
        fetchUsers();
    }, []);

    const getStatusBadge = (status) => {
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
                status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
            }`}>
                {status || 'active'}
            </span>
        );
    };

    if (loading && users.length === 0) return (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
    );

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User Management</h1>
                <p className="text-sm text-gray-500 mt-1">View registered customers and hotel owners.</p>
            </div>

            <div className="bg-white border rounded-xl shadow-sm overflow-hidden relative">
                {users.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No users found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50/50 border-b">
                                <tr>
                                    <th className="px-6 py-3 font-medium text-gray-500">User</th>
                                    <th className="px-6 py-3 font-medium text-gray-500">Email</th>
                                    <th className="px-6 py-3 font-medium text-gray-500">Role</th>
                                    <th className="px-6 py-3 font-medium text-gray-500">Status</th>
                                    <th className="px-6 py-3 font-medium text-gray-500">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map(user => (
                                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={user.image || 'https://placehold.co/40x40'} alt="" className="w-8 h-8 rounded-full border bg-white" />
                                                <span className="font-medium text-gray-900">{user.username || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize border`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
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

export default AdminUsers;
