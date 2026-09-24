import React, { useEffect } from 'react'
import Navbar from '../../components/hotelOwner/Navbar'
import Sidebar from '../../components/hotelOwner/Sidebar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'

const Layout = () => {
  
    const { isOwner, navigate, userDataFetched } = useAppContext();

    useEffect(() => {
      if (userDataFetched && !isOwner) {
        navigate('/')
      }
    }, [isOwner, navigate, userDataFetched])
    
    if (!userDataFetched) {
        return <div className="flex items-center justify-center h-screen bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div></div>
    }
    
    return (
    <div className='flex flex-col h-screen overflow-hidden'>
      <Navbar />
      <div className='flex flex-1 overflow-hidden'>
        <Sidebar />
        <main className='flex-1 p-4 pt-10 md:px-10 overflow-y-auto'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout