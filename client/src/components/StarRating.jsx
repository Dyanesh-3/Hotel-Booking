import React from 'react'
import { assets } from '../assets/assets'


const StarRating = ({rating=4}) => {
  return (
    <>
      {Array.from({ length: 5 }, (_, index) => (
        <img
          key={index}
          src={rating > index ? assets.starIconFilled : assets.starIconOutlined}
          alt="star-icon"
          className='w-4 h-4'
        />
      ))}
    </>
  )
}

export default StarRating