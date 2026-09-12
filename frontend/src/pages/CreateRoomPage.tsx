import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import api from '../api/axios'

interface RoomRequest {
  hotelId: string
  roomNumber: string
  roomType: string
  description: string
  pricePerNight: number
  capacity: number
  amenities: string[]
  images: string[]
}

function CreateRoomPage() {
  const { hotelId } = useParams()
  const navigate = useNavigate()

  const [roomNumber, setRoomNumber] = useState('')
  const [roomType, setRoomType] = useState('')
  const [description, setDescription] = useState('')
  const [pricePerNight, setPricePerNight] = useState('')
  const [capacity, setCapacity] = useState('')
  const [amenities, setAmenities] = useState('')
  const [images, setImages] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const parseList = (value: string) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (!hotelId) {
      setError('Hotel ID is missing')
      return
    }

    try {
      setLoading(true)
      setError('')

      const payload: RoomRequest = {
        hotelId,
        roomNumber,
        roomType,
        description,
        pricePerNight:
          Number(pricePerNight),
        capacity:
          Number(capacity),
        amenities:
          parseList(amenities),
        images:
          parseList(images),
      }

      await api.post(
        '/api/rooms',
        payload,
      )

      navigate(
        `/manager/hotels/${hotelId}/rooms`,
      )
    } catch (err: any) {
      console.error(
        'Failed to create room:',
        err,
      )

      setError(
        err.response?.data?.message ||
          'Failed to create room',
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
              Add Room
            </p>
          </div>

          <Link
            to={`/manager/hotels/${hotelId}/rooms`}
            className="rounded-lg bg-gray-600 px-5 py-2 font-medium text-white hover:bg-gray-700"
          >
            Back to Rooms
          </Link>

        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">

        <div className="rounded-xl bg-white p-8 shadow">

          <h2 className="mb-6 text-2xl font-bold text-gray-800">
            Room Information
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

              <InputField
                label="Room Number"
                value={roomNumber}
                onChange={setRoomNumber}
                placeholder="101"
                required
              />

              <InputField
                label="Room Type"
                value={roomType}
                onChange={setRoomType}
                placeholder="DELUXE"
                required
              />

              <InputField
                label="Price Per Night"
                value={pricePerNight}
                onChange={setPricePerNight}
                type="number"
                placeholder="149.99"
                required
              />

              <InputField
                label="Capacity"
                value={capacity}
                onChange={setCapacity}
                type="number"
                placeholder="2"
                required
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
                placeholder="Spacious deluxe room with city view"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <InputField
              label="Amenities"
              value={amenities}
              onChange={setAmenities}
              placeholder="WiFi, TV, Air Conditioning, Balcony"
            />

            <InputField
              label="Image URLs"
              value={images}
              onChange={setImages}
              placeholder="https://..., https://..."
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? 'Creating Room...'
                : 'Create Room'}
            </button>

          </form>

        </div>

      </main>

    </div>
  )
}

interface InputFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  required?: boolean
}

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
}: InputFieldProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}

export default CreateRoomPage