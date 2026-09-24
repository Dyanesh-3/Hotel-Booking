import React, { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const AdminLayout = () => {
    const { isAdmin, isLoaded, userDataFetched } = useAppContext();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    if (!isLoaded || !userDataFetched) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    if (!isAdmin) {
        return <Navigate to="/" />;
    }

    const navItems = [
        { name: 'Dashboard', path: '/admin', exact: true },
        { name: 'Hotels', path: '/admin/hotels' },
        { name: 'Pending Approvals', path: '/admin/hotels?filter=pending' },
        { name: 'Users', path: '/admin/users' },
        { name: 'Bookings', path: '/admin/bookings' },
        { name: 'Analytics', path: '/admin/analytics' },
    ];

    const checkIsActive = (item) => {
        if (item.name === 'Dashboard') {
            return location.pathname === '/admin' || location.pathname === '/admin/';
        }
        if (item.name === 'Pending Approvals') {
            return location.pathname === '/admin/hotels' && location.search.includes('filter=pending');
        }
        if (item.name === 'Hotels') {
            return location.pathname.startsWith('/admin/hotels') && !location.search.includes('filter=pending');
        }
        return location.pathname.startsWith(item.path);
    };

    return (
        <div className="flex h-screen pt-16">
            {/* Mobile menu toggle */}
            <div className="md:hidden fixed top-20 left-4 z-50">
                <button 
                    onClick={() => setSidebarOpen(!isSidebarOpen)}
                    className="p-2 bg-white rounded shadow border text-sm"
                >
                    {isSidebarOpen ? 'Close Menu' : 'Admin Menu'}
                </button>
            </div>

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 transform bg-white w-64 border-r shadow-lg transition-transform duration-200 ease-in-out z-40
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:relative md:translate-x-0 pt-16 md:pt-4 flex flex-col
            `}>
                <div className="px-6 pb-6">
                    <h2 className="text-xl font-bold text-gray-800 tracking-tight">Admin Portal</h2>
                </div>
                
                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
                    {navItems.map((item, idx) => {
                        const isActive = checkIsActive(item);
                        return (
                            <Link
                                key={idx}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center px-4 py-2.5 rounded-lg transition-colors font-medium text-sm ${
                                    isActive
                                        ? 'bg-black text-white'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                                }`}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t">
                    <Link to="/" className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                        Back to Website
                    </Link>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto w-full">
                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </div>
            
            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminLayout;
