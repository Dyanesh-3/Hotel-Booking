import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'

const experiences = [
  {
    title: 'Adventure & Outdoors',
    description: 'From mountain treks to desert safaris, unlock guided outdoor adventures curated with every stay.',
    icon: assets.mountainIcon,
    image: assets.roomImg1,
  },
  {
    title: 'Wellness & Spa',
    description: 'Unwind with rejuvenating spa rituals, infinity pools and wellness retreats at handpicked properties.',
    icon: assets.poolIcon,
    image: assets.roomImg2,
  },
  {
    title: 'Fine Dining',
    description: 'Savor chef-crafted breakfasts and world-class cuisine, from rooftop lounges to hidden local gems.',
    icon: assets.freeBreakfastIcon,
    image: assets.roomImg3,
  },
  {
    title: 'Signature Room Service',
    description: 'Round-the-clock, personalized in-room service designed to make every moment of your stay effortless.',
    icon: assets.roomServiceIcon,
    image: assets.roomImg4,
  },
]

const steps = [
  {
    title: 'Choose Your Destination',
    description: 'Browse handpicked hotels across our featured cities and filter by the experience you\'re after.',
  },
  {
    title: 'Book in Minutes',
    description: 'Select your dates and room, and confirm your booking securely in just a few clicks.',
  },
  {
    title: 'Live the Experience',
    description: 'Arrive and enjoy curated activities, dining and amenities arranged around your stay.',
  },
]

const Experience = () => {
  const { navigate } = useAppContext()

  return (
    <div className="pt-28 md:pt-32">

      {/* Hero */}
      <div className="relative px-6 md:px-16 lg:px-24 xl:px-32">
        <div className="relative rounded-2xl overflow-hidden h-[380px] md:h-[420px]">
          <img
            src={assets.heroImage}
            alt="veloreStay Experiences"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center text-center px-6">
            <p className="bg-secondary/90 px-3.5 py-1 rounded-full text-xs md:text-sm text-white tracking-wide">
              CURATED FOR YOU
            </p>
            <h1 className="font-playfair text-3xl md:text-5xl text-white mt-4 max-w-2xl">
              Experiences Beyond the Stay
            </h1>
            <p className="text-white/90 text-sm md:text-base mt-4 max-w-xl leading-relaxed">
              Every veloreStay booking opens the door to something more — adventure, wellness,
              cuisine and comfort, tailored to how you like to travel.
            </p>
          </div>
        </div>
      </div>

      {/* Experience Categories */}
      <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 py-20">
        <Title
          title="What You Can Experience"
          subTitle="Handpicked moments woven into every stay, no matter which veloreStay property you choose."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-16 w-full">
          {experiences.map((exp, index) => (
            <div
              key={index}
              className="group relative rounded-xl overflow-hidden shadow hover:shadow-lg transition-all duration-300"
            >
              <img
                src={exp.image}
                alt={exp.title}
                className="w-full h-56 object-cover group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 flex items-start gap-3">
                <div className="bg-white/90 rounded-full p-2 shrink-0">
                  <img src={exp.icon} alt="" className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-playfair text-xl text-white">{exp.title}</p>
                  <p className="text-white/85 text-sm mt-1 max-w-sm leading-relaxed">{exp.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 py-20">
        <Title
          title="How It Works"
          subTitle="Getting to your next experience takes just three simple steps."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full max-w-4xl">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center bg-white p-6 rounded-xl shadow">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white font-playfair text-lg">
                {index + 1}
              </div>
              <p className="font-playfair text-lg mt-4">{step.title}</p>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <h2 className="font-playfair text-2xl md:text-4xl text-gray-800">
          Ready for Your Next Experience?
        </h2>
        <p className="text-gray-500 max-w-md">
          Explore our featured destinations and find the stay that fits the experience you're after.
        </p>
        <button
          onClick={() => { navigate('/rooms'); window.scrollTo(0, 0) }}
          className="bg-primary text-white px-8 py-2.5 rounded-full mt-2 hover:bg-primary/90 transition-all cursor-pointer"
        >
          Browse Destinations
        </button>
      </div>

    </div>
  )
}

export default Experience
