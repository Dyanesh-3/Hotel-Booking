import React from 'react'
import Title from '../components/Title'
import { assets, cities } from '../assets/assets'
import { useAppContext } from '../context/AppContext'

const stats = [
  { label: 'Curated Properties', value: '500+' },
  { label: 'Cities Worldwide', value: '4+' },
  { label: 'Happy Guests', value: '25K+' },
  { label: 'Average Rating', value: '4.8/5' },
]

const values = [
  {
    icon: assets.badgeIcon,
    title: 'Trusted Quality',
    description: 'Every property listed on QuickStay is verified for comfort, safety and service standards.',
  },
  {
    icon: assets.heartIcon,
    title: 'Guest First',
    description: 'From search to check-out, we design every step around what makes a stay feel effortless.',
  },
  {
    icon: assets.locationFilledIcon,
    title: 'Global Reach',
    description: 'A growing collection of hotels across the world\'s most sought-after destinations.',
  },
]

const About = () => {
  const { navigate } = useAppContext()

  return (
    <div className="pt-28 md:pt-32">

      {/* Hero */}
      <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 xl:px-32 text-center">
        <p className="bg-secondary/20 text-secondary px-3.5 py-1 rounded-full text-xs md:text-sm tracking-wide">
          OUR STORY
        </p>
        <h1 className="font-playfair text-3xl md:text-5xl text-gray-800 mt-4 max-w-2xl">
          About QuickStay
        </h1>
        <p className="text-gray-500 text-sm md:text-base mt-4 max-w-xl leading-relaxed">
          We connect travelers with extraordinary places to stay — from boutique hotels to
          luxury villas — and make booking them refreshingly simple.
        </p>
      </div>

      {/* Story */}
      <div className="flex flex-col md:flex-row items-center gap-10 px-6 md:px-16 lg:px-24 xl:px-32 py-20">
        <img
          src={assets.regImage}
          alt="About QuickStay"
          className="w-full md:w-1/2 rounded-xl shadow-md object-cover max-h-96"
        />
        <div className="w-full md:w-1/2">
          <h2 className="font-playfair text-2xl md:text-3xl text-gray-800">Why We Started QuickStay</h2>
          <p className="text-gray-500 mt-4 leading-relaxed">
            Booking a hotel shouldn't mean sifting through endless listings and second-guessing
            the photos. QuickStay was built to bring together carefully selected properties,
            transparent pricing and a booking flow that takes minutes, not hours.
          </p>
          <p className="text-gray-500 mt-4 leading-relaxed">
            Today, hotel owners across {cities.join(', ')} and beyond list their properties on
            QuickStay, giving travelers a single place to find a stay that actually fits how
            they like to travel.
          </p>
          <button
            onClick={() => { navigate('/rooms'); window.scrollTo(0, 0) }}
            className="mt-6 px-6 py-2.5 text-sm font-medium border border-gray-300 rounded-full hover:bg-gray-50 transition-all cursor-pointer"
          >
            Explore Hotels
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 md:px-16 lg:px-24 xl:px-32 py-16 bg-slate-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              <p className="font-playfair text-3xl md:text-4xl text-primary">{stat.value}</p>
              <p className="text-gray-500 text-sm mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 py-20">
        <Title
          title="What We Stand For"
          subTitle="The principles that guide every property we bring onto QuickStay."
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 w-full">
          {values.map((value, index) => (
            <div key={index} className="flex flex-col items-center text-center bg-white p-6 rounded-xl shadow">
              <img src={value.icon} alt="" className="w-8 h-8" />
              <p className="font-playfair text-lg mt-4">{value.title}</p>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center bg-slate-50">
        <h2 className="font-playfair text-2xl md:text-4xl text-gray-800">
          Join Thousands of Happy Travelers
        </h2>
        <p className="text-gray-500 max-w-md">
          Start planning your next stay with a platform built around trust, ease and great places.
        </p>
        <button
          onClick={() => { navigate('/rooms'); window.scrollTo(0, 0) }}
          className="bg-primary text-white px-8 py-2.5 rounded-full mt-2 hover:bg-primary/90 transition-all cursor-pointer"
        >
          Book Your Stay
        </button>
      </div>

    </div>
  )
}

export default About
