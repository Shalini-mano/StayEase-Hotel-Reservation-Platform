import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import api from '../api/axios'

interface Hotel {
  id: string
  name: string
  description?: string
  address?: string
  city?: string
  country?: string
  postalCode?: string
  rating?: number
  amenities?: string[]
  images?: string[]
  policies?: string[]
  active: boolean
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function ManagerHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchHotels = async () => {
    try {
      setError('')

      const response =
        await api.get<ApiResponse<Hotel[]>>(
          '/api/hotels/my',
        )

      setHotels(response.data.data)
    } catch (err: any) {
      console.error(
        'Failed to load manager hotels:',
        err,
      )

      setError(
        err.response?.data?.message ||
          'Failed to load hotels',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHotels()
  }, [])

  const handleDelete = async (
    hotelId: string,
  ) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this hotel?',
    )

    if (!confirmed) {
      return
    }

    try {
      await api.delete(
        `/api/hotels/${hotelId}`,
      )

      setHotels((currentHotels) =>
        currentHotels.filter(
          (hotel) =>
            hotel.id !== hotelId,
        ),
      )
    } catch (err: any) {
      console.error(
        'Failed to delete hotel:',
        err,
      )

      setError(
        err.response?.data?.message ||
          'Failed to delete hotel',
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">
          Loading hotels...
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
              Manager Hotels
            </p>
          </div>

          <div className="flex gap-3">

            <Link
              to="/manager/dashboard"
              className="rounded-lg bg-gray-600 px-5 py-2 font-medium text-white hover:bg-gray-700"
            >
              Dashboard
            </Link>

            <Link
              to="/manager/hotels/create"
              className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
            >
              Create Hotel
            </Link>

          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">

        <h2 className="mb-6 text-3xl font-bold text-gray-800">
          My Hotels
        </h2>

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {hotels.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow">
            <p className="text-gray-500">
              No hotels found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                className="rounded-xl bg-white p-6 shadow"
              >

                <div className="mb-4 flex items-start justify-between">

                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {hotel.name}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {hotel.city}
                      {hotel.country
                        ? `, ${hotel.country}`
                        : ''}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      hotel.active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {hotel.active
                      ? 'Active'
                      : 'Inactive'}
                  </span>

                </div>

                {hotel.description && (
                  <p className="mb-4 text-gray-600">
                    {hotel.description}
                  </p>
                )}

                <div className="mb-5 space-y-2 text-sm text-gray-600">

                  <p>
                    <span className="font-semibold">
                      Address:
                    </span>{' '}
                    {hotel.address || '-'}
                  </p>

                  <p>
                    <span className="font-semibold">
                      Rating:
                    </span>{' '}
                    {Number(
                      hotel.rating || 0,
                    ).toFixed(1)}
                  </p>

                  <p>
                    <span className="font-semibold">
                      Amenities:
                    </span>{' '}
                    {hotel.amenities &&
                    hotel.amenities.length > 0
                      ? hotel.amenities.join(', ')
                      : '-'}
                  </p>

                </div>

                <div className="flex flex-wrap gap-3">

                  <Link
                    to={`/manager/hotels/${hotel.id}/edit`}
                    className="rounded-lg bg-yellow-500 px-4 py-2 font-medium text-white hover:bg-yellow-600"
                  >
                    Edit
                  </Link>

                  <Link
                    to={`/manager/hotels/${hotel.id}/rooms`}
                    className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700"
                  >
                    Manage Rooms
                  </Link>

                  <button
                    onClick={() =>
                      handleDelete(hotel.id)
                    }
                    className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                  >
                    Delete
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </main>
    </div>
  )
}

export default ManagerHotelsPage