import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='bg-[#F6F9FC] text-gray-500/80 pt-8 px-6 md:px-16 lg:px-24 xl:px-32'>
            <div className='flex flex-wrap justify-between gap-12 md:gap-6'>
                <div className='max-w-80'>
                    <img src={assets.logo} alt="logo" className='mb-4 h-8 md:h-9 invert opacity-80' />
                    <p className='text-sm'>
                        Discover the world's most extraordinary places to stay, from boutique hotels to luxury villas and private islands.
                    </p>
                    <div className='flex items-center gap-3 mt-4'>
                        {/* Instagram */}
                        <img src={assets.instagramIcon} alt="instagram-icon" className='w-6' />
                        <img src={assets.facebookIcon} alt="facebook-icon" className='w-6' />
                        <img src={assets.twitterIcon} alt="twitter-icon" className='w-6' />
                        <img src={assets.linkendinIcon} alt="linkedin-icon" className='w-6' />
                        
                    </div>
                </div>

                <div>
                    <p className='font-playfairtext-lg text-gray-800'>COMPANY</p>
                    <ul className='mt-3 flex flex-col gap-2 text-sm'>
                        <li><a href="#">About</a></li>
                        <li><a href="#">Careers</a></li>
                        <li><a href="#">Press</a></li>
                        <li><a href="#">Blog</a></li>
                        <li><a href="#">Partners</a></li>
                    </ul>
                </div>

                <div>
                    <p className='font-playfair text-lg text-gray-800'>SUPPORT</p>
                    <ul className='mt-3 flex flex-col gap-2 text-sm'>
                        <li><a href="#">Help Center</a></li>
                        <li><a href="#">Safety Information</a></li>
                        <li><a href="#">Cancellation Options</a></li>
                        <li><a href="#">Contact Us</a></li>
                        <li><a href="#">Accessibility</a></li>
                    </ul>
                </div>

                <div className='max-w-80'>
                    <p className='font-playfair text-lg text-gray-800'>CONTACT & SUPPORT</p>
                    <ul className='mt-3 flex flex-col gap-3 text-sm'>
                        <li className='flex items-start gap-2'>
                            <svg className='w-4 h-4 mt-0.5 shrink-0 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'/>
                            </svg>
                            <a href='mailto:support@velorestay.com' className='hover:text-gray-700 transition-colors'>support@velorestay.com</a>
                        </li>
                        <li className='flex items-start gap-2'>
                            <svg className='w-4 h-4 mt-0.5 shrink-0 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'/>
                            </svg>
                            <span>+1 (800) 835-6736</span>
                        </li>
                        <li className='flex items-start gap-2'>
                            <svg className='w-4 h-4 mt-0.5 shrink-0 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'/>
                            </svg>
                            <span>Mon – Sun &nbsp;·&nbsp; 24 / 7 Support</span>
                        </li>
                        <li className='flex items-start gap-2'>
                            <svg className='w-4 h-4 mt-0.5 shrink-0 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'/>
                            </svg>
                            <a href='#' className='hover:text-gray-700 transition-colors'>Live Chat Available</a>
                        </li>
                    </ul>
                </div>
            </div>
            <hr className='border-gray-300 mt-8' />
            <div className='flex flex-col md:flex-row gap-2 items-center justify-between py-5'>
                <p>© {new Date().getFullYear()} veloreStay. All rights reserved.</p>
                <ul className='flex items-center gap-4'>
                    <li><a href="#">Privacy</a></li>
                    <li><a href="#">Terms</a></li>
                    <li><a href="#">Sitemap</a></li>
                </ul>
            </div>
        </div>
  )
}

export default Footer