import React from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HotelReg from './components/HotelReg'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import AllRooms from './pages/AllRooms'
import RoomDetails from './pages/RoomDetails'
import MyBookings from './pages/MyBookings'
import About from './pages/About'
import Experience from './pages/Experience'
import Layout from './pages/hotelOwner/Layout'
import Dashboard from './pages/hotelOwner/Dashboard'
import AddRoom from './pages/hotelOwner/AddRoom'
import ListRoom from './pages/hotelOwner/ListRoom'
import EditHotel from './pages/hotelOwner/EditHotel'
import {Toaster} from 'react-hot-toast'
import {useAppContext} from "./context/AppContext"
import Loader from './components/Loader'
import SignUpPage from './pages/SignUpPage'
import SignInPage from './pages/SignInPage'

import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminHotels from './pages/admin/AdminHotels'
import AdminHotelDetails from './pages/admin/AdminHotelDetails'
import AdminUsers from './pages/admin/AdminUsers'
import AdminBookings from './pages/admin/AdminBookings'
import AdminAnalytics from './pages/admin/AdminAnalytics'

const App = () => {
  const isOwnerPath = useLocation().pathname.includes("owner");
  const isAdminPath = useLocation().pathname.includes("admin");
  const {showHotelReg} = useAppContext();

  const bgColor = (isOwnerPath || isAdminPath) ? 'bg-[#F7F8FA] text-[#111827]' : 'bg-[#FAFAF8] text-[#111827]';

  return (
    <div className={`${bgColor} min-h-screen transition-colors duration-300 font-outfit`}>
      <Toaster/>
      {!(isOwnerPath || isAdminPath) && <Navbar />}
      {showHotelReg && <HotelReg />}
      <div className='min-h-[70vh]'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/rooms' element={<AllRooms />} />
          <Route path='/hotels' element={<AllRooms />} />
          <Route path='/rooms/:id' element={<RoomDetails />} />
          <Route path='/my-bookings' element={<MyBookings />} />
          <Route path='/about' element={<About />} />
          <Route path='/experience' element={<Experience />} />
          <Route path='/loader/:nextUrl' element={<Loader />} />
          <Route path='/sign-up' element={<SignUpPage />} />
          <Route path='/sign-in' element={<SignInPage />} />

          <Route path='/owner' element={<Layout />} >
              <Route index element={<Dashboard/>} />
              <Route path='edit-hotel' element={<EditHotel/>} />
              <Route path='add-room' element={<AddRoom/>} />
              <Route path='list-room' element={<ListRoom/>} />
          </Route>

          <Route path='/admin' element={<AdminLayout />} >
              <Route index element={<AdminDashboard />} />
              <Route path='hotels' element={<AdminHotels />} />
              <Route path='hotels/:id' element={<AdminHotelDetails />} />
              <Route path='users' element={<AdminUsers />} />
              <Route path='bookings' element={<AdminBookings />} />
              <Route path='analytics' element={<AdminAnalytics />} />
          </Route>
        </Routes>
      </div>
      <Footer/>
    </div>
  )
}

export default App