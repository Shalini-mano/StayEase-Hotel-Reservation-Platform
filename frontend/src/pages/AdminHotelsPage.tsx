import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import api from '../api/axios'

interface Hotel {
  id: string
  name: string
  description?: string
  address: string
  city: string
  country: string
  postalCode?: string
  rating: number
  amenities?: string[]
  images?: string[]
  policies?: string
  active: boolean
  managerId?: string
}

interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function AdminHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [city, setCity] = useState('')
  const [activeFilter, setActiveFilter] = useState('')

  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const pageSize = 10

  const fetchHotels = async () => {
    try {
      setLoading(true)
      setError('')

      const params: Record<string, string | number | boolean> = {
        page,
        size: pageSize,
        sortBy: 'createdAt',
        direction: 'desc',
      }

      if (city.trim()) {
        params.city = city.trim()
      }

      if (activeFilter === 'true') {
        params.active = true
      }

      if (activeFilter === 'false') {
        params.active = false
      }

      const response =
        await api.get<
          ApiResponse<PageResponse<Hotel>>
        >('/api/admin/hotels', {
          params,
        })

      const data = response.data.data

      setHotels(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (err: any) {
      console.error('Failed to load hotels:', err)

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
  }, [page, activeFilter])

  const handleSearch = () => {
    setPage(0)
    fetchHotels()
  }

  const handleClearFilters = () => {
    setCity('')
    setActiveFilter('')
    setPage(0)

    setTimeout(() => {
      fetchHotels()
    }, 0)
  }

  const handleStatusChange = async (
    hotel: Hotel,
  ) => {
    try {
      setActionLoading(hotel.id)
      setError('')
      setMessage('')

      const endpoint = hotel.active
        ? `/api/admin/hotels/${hotel.id}/deactivate`
        : `/api/admin/hotels/${hotel.id}/activate`

      const response =
        await api.patch<ApiResponse<Hotel>>(
          endpoint,
        )

      const updatedHotel =
        response.data.data

      setHotels((currentHotels) =>
        currentHotels.map((item) =>
          item.id === hotel.id
            ? updatedHotel
            : item,
        ),
      )

      setMessage(
        response.data.message,
      )
    } catch (err: any) {
      console.error(
        'Failed to change hotel status:',
        err,
      )

      setError(
        err.response?.data?.message ||
          'Failed to change hotel status',
      )
    } finally {
      setActionLoading(null)
    }
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
              Admin Hotel Management
            </p>
          </div>

          <Link
            to="/admin/dashboard"
            className="rounded-lg bg-gray-600 px-5 py-2 font-medium text-white hover:bg-gray-700"
          >
            Back to Dashboard
          </Link>

        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">

        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            Hotels
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Total Hotels: {totalElements}
          </p>
        </div>

        <div className="mb-6 rounded-xl bg-white p-5 shadow">

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                City
              </label>

              <input
                type="text"
                value={city}
                onChange={(event) =>
                  setCity(event.target.value)
                }
                placeholder="Amsterdam"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                value={activeFilter}
                onChange={(event) => {
                  setActiveFilter(event.target.value)
                  setPage(0)
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">
                  All Hotels
                </option>

                <option value="true">
                  Active
                </option>

                <option value="false">
                  Inactive
                </option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleSearch}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
              >
                Search
              </button>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleClearFilters}
                className="w-full rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300"
              >
                Clear Filters
              </button>
            </div>

          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-lg bg-green-100 px-4 py-3 text-green-700">
            {message}
          </div>
        )}

        <div className="overflow-hidden rounded-xl bg-white shadow">

          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading hotels...
            </div>
          ) : hotels.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hotels found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead className="bg-gray-50">
                  <tr>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Hotel
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Location
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Rating
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Manager
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">

                  {hotels.map((hotel) => (

                    <tr
                      key={hotel.id}
                      className="hover:bg-gray-50"
                    >

                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {hotel.name}
                        </div>

                        <div className="mt-1 text-xs text-gray-400">
                          {hotel.id}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div>
                          {hotel.city},{' '}
                          {hotel.country}
                        </div>

                        <div className="text-xs text-gray-400">
                          {hotel.address}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="font-medium text-gray-700">
                          {Number(
                            hotel.rating || 0,
                          ).toFixed(1)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {hotel.managerId || '-'}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            hotel.active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {hotel.active
                            ? 'Active'
                            : 'Inactive'}
                        </span>

                      </td>

                      <td className="whitespace-nowrap px-6 py-4">

                        <button
                          type="button"
                          disabled={
                            actionLoading ===
                            hotel.id
                          }
                          onClick={() =>
                            handleStatusChange(
                              hotel,
                            )
                          }
                          className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
                            hotel.active
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {actionLoading ===
                          hotel.id
                            ? 'Updating...'
                            : hotel.active
                              ? 'Deactivate'
                              : 'Activate'}
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>
              </table>

            </div>
          )}

        </div>

        {!loading &&
          totalPages > 0 && (
            <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">

              <p className="text-sm text-gray-600">
                Page {page + 1} of{' '}
                {totalPages}
              </p>

              <div className="flex gap-2">

                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() =>
                    setPage(
                      (current) =>
                        current - 1,
                    )
                  }
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={
                    page >=
                    totalPages - 1
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        current + 1,
                    )
                  }
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>

              </div>
            </div>
          )}

      </main>
    </div>
  )
}

export default AdminHotelsPage