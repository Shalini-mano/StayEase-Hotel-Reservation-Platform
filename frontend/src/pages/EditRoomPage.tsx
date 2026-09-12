import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import api from '../api/axios'

interface Room {
  id: string
  hotelId: string
  roomNumber: string
  roomType: string
  description?: string
  pricePerNight: number
  capacity: number
  amenities?: string[]
  images?: string[]
  available?: boolean
}

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

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function EditRoomPage() {
  const { hotelId, roomId } = useParams()
  const navigate = useNavigate()

  const [roomNumber, setRoomNumber] = useState('')
  const [roomType, setRoomType] = useState('')
  const [description, setDescription] = useState('')
  const [pricePerNight, setPricePerNight] = useState('')
  const [capacity, setCapacity] = useState('')
  const [amenities, setAmenities] = useState('')
  const [images, setImages] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const parseList = (value: string) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

  useEffect(() => {
    const fetchRoom = async () => {
      if (!roomId) {
        setError('Room ID is missing')
        setLoading(false)
        return
      }

      try {
        setError('')

        const response =
          await api.get<ApiResponse<Room>>(
            `/api/rooms/${roomId}`,
          )

        const room = response.data.data

        setRoomNumber(room.roomNumber || '')
        setRoomType(room.roomType || '')
        setDescription(room.description || '')
        setPricePerNight(
          String(room.pricePerNight),
        )
        setCapacity(
          String(room.capacity),
        )
        setAmenities(
          room.amenities?.join(', ') || '',
        )
        setImages(
          room.images?.join(', ') || '',
        )
      } catch (err: any) {
        console.error(
          'Failed to load room:',
          err,
        )

        setError(
          err.response?.data?.message ||
            'Failed to load room',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchRoom()
  }, [roomId])

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (!hotelId || !roomId) {
      setError('Hotel ID or Room ID is missing')
      return
    }

    const price = Number(pricePerNight)
    const roomCapacity = Number(capacity)

    if (
      Number.isNaN(price) ||
      price <= 0
    ) {
      setError(
        'Price per night must be greater than zero',
      )
      return
    }

    if (
      Number.isNaN(roomCapacity) ||
      roomCapacity < 1
    ) {
      setError(
        'Capacity must be at least 1',
      )
      return
    }

    try {
      setSaving(true)
      setError('')

      const payload: RoomRequest = {
        hotelId,
        roomNumber,
        roomType,
        description,
        pricePerNight: price,
        capacity: roomCapacity,
        amenities: parseList(amenities),
        images: parseList(images),
      }

      await api.put(
        `/api/rooms/${roomId}`,
        payload,
      )

      navigate(
        `/manager/hotels/${hotelId}/rooms`,
      )
    } catch (err: any) {
      console.error(
        'Failed to update room:',
        err,
      )

      setError(
        err.response?.data?.message ||
          'Failed to update room',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">
          Loading room...
        </p>
      </div>
    )
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
              Edit Room
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
            Update Room
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
                required
              />

              <InputField
                label="Room Type"
                value={roomType}
                onChange={setRoomType}
                required
              />

              <InputField
                label="Price Per Night"
                value={pricePerNight}
                onChange={setPricePerNight}
                type="number"
                required
              />

              <InputField
                label="Capacity"
                value={capacity}
                onChange={setCapacity}
                type="number"
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
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <InputField
              label="Amenities"
              value={amenities}
              onChange={setAmenities}
              placeholder="WiFi, TV, Balcony, Air Conditioning"
            />

            <InputField
              label="Image URLs"
              value={images}
              onChange={setImages}
              placeholder="https://..., https://..."
            />

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving
                  ? 'Updating Room...'
                  : 'Update Room'}
              </button>

              <Link
                to={`/manager/hotels/${hotelId}/rooms`}
                className="rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </Link>
            </div>
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
  required?: boolean
  placeholder?: string
}

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder,
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
        step={type === 'number' ? 'any' : undefined}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}

export default EditRoomPage