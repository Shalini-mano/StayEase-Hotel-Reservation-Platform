import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import api from '../api/axios'

interface HotelRequest {
  name: string
  description: string
  address: string
  city: string
  country: string
  postalCode: string
  latitude?: number
  longitude?: number
  amenities: string[]
  images: string[]
  policies: string
}

function CreateHotelPage() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [postalCode, setPostalCode] = useState('')

  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')

  const [amenities, setAmenities] = useState('')
  const [images, setImages] = useState('')
  const [policies, setPolicies] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const parseList = (value: string) => {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    try {
      setLoading(true)
      setError('')

   const payload: HotelRequest = {
     name,
     description,
     address,
     city,
     country,
     postalCode,
     amenities: parseList(amenities),
     images: parseList(images),
     policies: policies,
   }

      if (latitude.trim()) {
        payload.latitude = Number(latitude)
      }

      if (longitude.trim()) {
        payload.longitude = Number(longitude)
      }

      await api.post(
        '/api/hotels',
        payload,
      )

      navigate('/manager/hotels')
    } catch (err: any) {
      console.error(
        'Failed to create hotel:',
        err,
      )

      setError(
        err.response?.data?.message ||
          'Failed to create hotel',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">

          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              StayEase
            </h1>

            <p className="text-sm text-gray-500">
              Create Hotel
            </p>
          </div>

          <Link
            to="/manager/hotels"
            className="rounded-lg bg-gray-600 px-5 py-2 font-medium text-white hover:bg-gray-700"
          >
            Back to Hotels
          </Link>

        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">

        <div className="rounded-xl bg-white p-8 shadow">

          <h2 className="mb-6 text-2xl font-bold text-gray-800">
            Hotel Information
          </h2>

          {error && (
            <div className="mb-6 rounded-lg bg-red-100 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              <FormField
                label="Hotel Name"
                value={name}
                onChange={setName}
                required
              />

              <FormField
                label="City"
                value={city}
                onChange={setCity}
                required
              />

              <FormField
                label="Country"
                value={country}
                onChange={setCountry}
                required
              />

              <FormField
                label="Postal Code"
                value={postalCode}
                onChange={setPostalCode}
                required
              />

              <FormField
                label="Address"
                value={address}
                onChange={setAddress}
                required
              />

              <FormField
                label="Latitude"
                value={latitude}
                onChange={setLatitude}
                type="number"
              />

              <FormField
                label="Longitude"
                value={longitude}
                onChange={setLongitude}
                type="number"
              />

            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                rows={4}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Amenities
              </label>

              <input
                type="text"
                value={amenities}
                onChange={(event) =>
                  setAmenities(event.target.value)
                }
                placeholder="WiFi, Parking, Breakfast, Pool"
                className="w-full rounded-lg border border-gray-300 px-4 py-3
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <p className="mt-1 text-xs text-gray-500">
                Separate items with commas.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Image URLs
              </label>

              <input
                type="text"
                value={images}
                onChange={(event) =>
                  setImages(event.target.value)
                }
                placeholder="https://..., https://..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <p className="mt-1 text-xs text-gray-500">
                Separate image URLs with commas.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Policies
              </label>

              <input
                type="text"
                value={policies}
                onChange={(event) =>
                  setPolicies(event.target.value)
                }
                placeholder="No smoking, Check-in after 14:00"
                className="w-full rounded-lg border border-gray-300 px-4 py-3
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <p className="mt-1 text-xs text-gray-500">
                Separate policies with commas.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white
                         hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? 'Creating Hotel...'
                : 'Create Hotel'}
            </button>

          </form>

        </div>
      </main>
    </div>
  )
}

interface FormFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  type?: string
}

function FormField({
  label,
  value,
  onChange,
  required = false,
  type = 'text',
}: FormFieldProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        required={required}
        className="w-full rounded-lg border border-gray-300 px-4 py-3
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}

export default CreateHotelPage