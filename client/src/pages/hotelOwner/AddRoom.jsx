import React, { useState } from 'react'
import Title from '../../components/Title'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import { toast } from 'react-hot-toast'

const AddRoom = () => {

  const { axios, getToken, fetchRooms } = useAppContext()

  const [images, setImages] = useState({
    1: null, 
    2: null,
    3: null,
    4: null
  })

  // Fixed state variable name to 'inputs' to match usage
  const [inputs, setInputs] = useState({
    roomType: '',
    pricePerNight: '',
    amenities: {
      'Free WiFi': false,
      'Free Breakfast': false,
      'Room Service': false,
      'Mountain View': false,
      'Pool Access': false
    }
  })

  const [loading, setLoading] = useState(false)

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    const selectedFiles = Object.values(images).filter(Boolean)
    if (!inputs.roomType || !inputs.pricePerNight || !inputs.amenities || selectedFiles.length === 0) {
      toast.error("Please fill in all the details and select at least one image")
      return;
    }

    // Client-side file validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    for (const file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Invalid file type (${file.name}). Only JPG, PNG, and WebP are allowed.`)
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum allowed size is 5MB.`)
        return;
      }
    }

    setLoading(true);
    try {
      const token = await getToken()

      // 1. Request signed upload parameters from backend
      const { data: sigData } = await axios.get('/api/room/upload-signature', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!sigData.success) {
        toast.error(sigData.message || "Failed to authorize image upload")
        setLoading(false);
        return;
      }

      // 2. Upload images directly from browser to Cloudinary
      const uploadPromises = selectedFiles.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('api_key', sigData.apiKey)
        formData.append('timestamp', sigData.timestamp)
        formData.append('signature', sigData.signature)
        formData.append('folder', sigData.folder)

        const res = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        })

        const data = await res.json()
        if (!res.ok || !data.secure_url) {
          throw new Error(data.error?.message || "Cloudinary image upload failed")
        }
        return data.secure_url
      })

      const uploadedImageUrls = await Promise.all(uploadPromises)

      // 3. Send lightweight JSON room details & image URLs to the room-creation API
      const amenities = Object.keys(inputs.amenities).filter(key => inputs.amenities[key])

      const payload = {
        roomType: inputs.roomType,
        pricePerNight: inputs.pricePerNight,
        amenities: JSON.stringify(amenities),
        images: uploadedImageUrls,
      }

      const { data } = await axios.post('/api/room', payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      if (data.success) {
        toast.success(data.message)
        if (fetchRooms) {
          fetchRooms()
        }
        setInputs({
          roomType: '',
          pricePerNight: '',
          amenities: {
            'Free WiFi': false,
            'Free Breakfast': false,
            'Room Service': false,
            'Mountain View': false,
            'Pool Access': false
          }
        })
        setImages({ 1: null, 2: null, 3: null, 4: null })
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmitHandler}>
      <Title 
        align='left' 
        font='outfit' 
        title='Add Room' 
        subTitle='Fill in the details carefully with accurate room details, pricing, and amenities to enhance the user booking experience.'
      />

      {/* Upload Area For Images */}
      <p className='text-gray-800 mt-10'>Image</p>
      <div className='sm:flex gap-4 my-2 flex-wrap'>
        {Object.keys(images).map((key) => (
          <label htmlFor={`roomImage${key}`} key={key}>
            <img 
              className='max-h-13 cursor-pointer opacity-80' 
              src={images[key] ? URL.createObjectURL(images[key]) : assets.uploadArea} 
              alt=""
            />
            <input 
              type="file" 
              accept='image/*' 
              id={`roomImage${key}`} 
              hidden 
              onChange={e => setImages({...images, [key]: e.target.files[0]})}
            />
          </label>
        ))}
      </div>

      <div className='w-full flex max-sm:flex-col sm:gap-4 mt-4'>
        <div className='flex-1 max-w-48'>
          <p className='text-gray-800 mt-4'>Room Type</p>
          <select 
            onChange={e => setInputs({...inputs, roomType: e.target.value})} 
            value={inputs.roomType}
            className='border opacity-70 border-gray-300 mt-1 rounded p-2 w-full'
          >
            <option value="">Select Room Type</option>
            <option value="Single Bed">Single Bed</option>
            <option value="Double Bed">Double Bed</option>
            <option value="Luxury Room">Luxury Room</option>
            <option value="Family Suite">Family Suite</option>
          </select>
        </div>

        <div>
          <p className='mt-4 text-gray-800'> 
            Price<span className='text-xs'>/night</span>
          </p>
          <input 
            type="number" 
            placeholder='0' 
            className='border border-gray-300 mt-1 rounded p-2 w-24' 
            value={inputs.pricePerNight} 
            onChange={e => setInputs({...inputs, pricePerNight: e.target.value})} 
          />
        </div>
      </div>

      <p className='text-gray-800 mt-4'>Amenities</p>
      <div className='flex flex-col flex-wrap mt-1 text-gray-400 max-w-sm gap-1'>
        {Object.keys(inputs.amenities).map((amenity, index) => (
          <div key={index} className='flex items-center gap-2'>
            <input 
              type="checkbox" 
              id={`amenities${index + 1}`} 
              checked={inputs.amenities[amenity]} 
              onChange={() => setInputs({
                ...inputs, 
                amenities: {
                  ...inputs.amenities, 
                  [amenity]: !inputs.amenities[amenity]
                }
              })}
            />
            <label htmlFor={`amenities${index + 1}`}>{amenity}</label>
          </div>
        ))}
      </div>

      <button 
        type='submit' 
        disabled={loading}
        className='bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-2 rounded mt-8 cursor-pointer transition-all'
      >
        {loading ? 'Adding...' : 'Add Room'}
      </button>
    </form>
  )
}

export default AddRoom
