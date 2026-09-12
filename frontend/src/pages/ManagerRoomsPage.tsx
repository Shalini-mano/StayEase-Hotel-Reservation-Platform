import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

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
  available: boolean
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function ManagerRoomsPage() {
  const { hotelId } = useParams()

  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchRooms = async () => {
    try {
      setError('')

      const response =
        await api.get<ApiResponse<Room[]>>(
          `/api/rooms/hotel/${hotelId}`,
        )

      setRooms(response.data.data)
    } catch (err: any) {
      console.error(
        'Failed to load rooms:',
        err,
      )

      setError(
        err.response?.data?.message ||
          'Failed to load rooms',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [hotelId])

  const handleDelete = async (
    roomId: string,
  ) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this room?',
    )

    if (!confirmed) {
      return
    }

    try {
      await api.delete(
        `/api/rooms/${roomId}`,
      )

      setRooms((currentRooms) =>
        currentRooms.filter(
          (room) =>
            room.id !== roomId,
        ),
      )
    } catch (err: any) {
      console.error(
        'Failed to delete room:',
        err,
      )

      setError(
        err.response?.data?.message ||
          'Failed to delete room',
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">
          Loading rooms...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <header className="bg-white shadow-sm">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              StayEase
            </h1>

            <p className="text-sm text-gray-500">
              Room Management
            </p>
          </div>

          <div className="flex gap-3">

            <Link
              to="/manager/hotels"
              className="rounded-lg bg-gray-600 px-5 py-2 font-medium text-white hover:bg-gray-700"
            >
              Back to Hotels
            </Link>

            <Link
              to={`/manager/hotels/${hotelId}/rooms/create`}
              className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
            >
              Add Room
            </Link>

          </div>

        </div>

      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">

        <h2 className="mb-6 text-3xl font-bold text-gray-800">
          Rooms
        </h2>

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {rooms.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow">

            <p className="mb-4 text-gray-500">
              No rooms found for this hotel.
            </p>

            <Link
              to={`/manager/hotels/${hotelId}/rooms/create`}
              className="inline-block rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
            >
              Create First Room
            </Link>

          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

            {rooms.map((room) => (
              <div
                key={room.id}
                className="overflow-hidden rounded-xl bg-white shadow"
              >

                {room.images &&
                room.images.length > 0 ? (
                  <img
                    src={room.images[0]}
                    alt={`Room ${room.roomNumber}`}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-gray-200 text-gray-500">
                    No Image
                  </div>
                )}

                <div className="p-6">

                  <div className="mb-4 flex items-start justify-between">

                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        Room {room.roomNumber}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {room.roomType}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        room.available
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {room.available
                        ? 'Available'
                        : 'Unavailable'}
                    </span>

                  </div>

                  {room.description && (
                    <p className="mb-4 text-sm text-gray-600">
                      {room.description}
                    </p>
                  )}

                  <div className="mb-4 space-y-2 text-sm">

                    <p>
                      <span className="font-semibold">
                        Price:
                      </span>{' '}
                      €{Number(
                        room.pricePerNight,
                      ).toFixed(2)} / night
                    </p>

                    <p>
                      <span className="font-semibold">
                        Capacity:
                      </span>{' '}
                      {room.capacity} guest
                      {room.capacity !== 1
                        ? 's'
                        : ''}
                    </p>

                    <p>
                      <span className="font-semibold">
                        Amenities:
                      </span>{' '}
                      {room.amenities &&
                      room.amenities.length > 0
                        ? room.amenities.join(', ')
                        : '-'}
                    </p>

                  </div>

                  <div className="flex flex-wrap gap-3">

                    <Link
                      to={`/manager/hotels/${hotelId}/rooms/${room.id}/edit`}
                      className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() =>
                        handleDelete(room.id)
                      }
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </main>

    </div>
  )
}

export default ManagerRoomsPage