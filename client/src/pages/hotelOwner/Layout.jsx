import React, { useEffect } from 'react'
import Navbar from '../../components/hotelOwner/Navbar'
import Sidebar from '../../components/hotelOwner/Sidebar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'

const Layout = () => {
  
    const { isOwner, navigate } = useAppContext();

    useEffect(() => {
      if (!isOwner) {
        navigate('/')
      }
    }, [isOwner, navigate])
    
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