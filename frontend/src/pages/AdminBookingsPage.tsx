import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import api from '../api/axios'

type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED'

interface AdminBooking {
  id: string
  userId: string
  customerName?: string
  customerEmail?: string
  hotelId: string
  hotelName?: string
  roomId: string
  roomNumber?: string
  roomType?: string
  checkIn: string
  checkOut: string
  guests: number
  numberOfNights: number
  pricePerNight: number
  totalPrice: number
  status: BookingStatus
  createdAt?: string
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

function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([])

  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [status, setStatus] = useState('')
  const [hotelId, setHotelId] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const pageSize = 10

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError('')

      const params: Record<string, string | number> = {
        page,
        size: pageSize,
        sortBy: 'createdAt',
        direction: 'desc',
      }

      if (status) {
        params.status = status
      }

      if (hotelId.trim()) {
        params.hotelId = hotelId.trim()
      }

      const response =
        await api.get<
          ApiResponse<PageResponse<AdminBooking>>
        >('/api/admin/bookings', {
          params,
        })

      const data = response.data.data

      setBookings(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (err: any) {
      console.error(
        'Failed to load admin bookings:',
        err,
      )

      setError(
        err.response?.data?.message ||
          'Failed to load bookings',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [page, status])

  const handleSearch = () => {
    setPage(0)
    fetchBookings()
  }

  const handleClear = () => {
    setStatus('')
    setHotelId('')
    setPage(0)

    setTimeout(() => {
      fetchBookings()
    }, 0)
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
              Admin Booking Management
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
            Bookings
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Total Bookings: {totalElements}
          </p>
        </div>

        <div className="mb-6 rounded-xl bg-white p-5 shadow">

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value)
                  setPage(0)
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">
                  All Statuses
                </option>

                <option value="PENDING">
                  Pending
                </option>

                <option value="CONFIRMED">
                  Confirmed
                </option>

                <option value="COMPLETED">
                  Completed
                </option>

                <option value="CANCELLED">
                  Cancelled
                </option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Hotel ID
              </label>

              <input
                type="text"
                value={hotelId}
                onChange={(event) =>
                  setHotelId(event.target.value)
                }
                placeholder="Enter hotel ID"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                onClick={handleClear}
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

        <div className="overflow-hidden rounded-xl bg-white shadow">

          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading bookings...
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No bookings found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead className="bg-gray-50">
                  <tr>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Booking
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Hotel
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Room
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Stay
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Total
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">

                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-gray-50"
                    >

                      <td className="px-6 py-4">

                        <div className="font-medium text-gray-900">
                          {booking.id}
                        </div>

                        {booking.createdAt && (
                          <div className="mt-1 text-xs text-gray-400">
                            {new Date(
                              booking.createdAt,
                            ).toLocaleString()}
                          </div>
                        )}

                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">

                        <div className="font-medium text-gray-800">
                          {booking.customerName ||
                            booking.userId}
                        </div>

                        {booking.customerEmail && (
                          <div className="text-xs text-gray-400">
                            {booking.customerEmail}
                          </div>
                        )}

                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">

                        <div className="font-medium">
                          {booking.hotelName ||
                            booking.hotelId}
                        </div>

                        {booking.hotelName && (
                          <div className="text-xs text-gray-400">
                            {booking.hotelId}
                          </div>
                        )}

                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">

                        <div>
                          {booking.roomNumber
                            ? `Room ${booking.roomNumber}`
                            : booking.roomId}
                        </div>

                        {booking.roomType && (
                          <div className="text-xs text-gray-400">
                            {booking.roomType}
                          </div>
                        )}

                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">

                        <div>
                          {booking.checkIn}
                        </div>

                        <div>
                          to {booking.checkOut}
                        </div>

                        <div className="mt-1 text-xs text-gray-400">
                          {booking.guests}{' '}
                          guest
                          {booking.guests !== 1
                            ? 's'
                            : ''}
                          {' · '}
                          {booking.numberOfNights}{' '}
                          night
                          {booking.numberOfNights !== 1
                            ? 's'
                            : ''}
                        </div>

                      </td>

                      <td className="whitespace-nowrap px-6 py-4">

                        <div className="font-semibold text-gray-800">
                          €
                          {Number(
                            booking.totalPrice || 0,
                          ).toFixed(2)}
                        </div>

                        <div className="text-xs text-gray-400">
                          €
                          {Number(
                            booking.pricePerNight ||
                              0,
                          ).toFixed(2)}
                          /night
                        </div>

                      </td>

                      <td className="whitespace-nowrap px-6 py-4">

                        <StatusBadge
                          status={booking.status}
                        />

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
                Page {page + 1} of {totalPages}
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
                    page >= totalPages - 1
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

function StatusBadge({
  status,
}: {
  status: BookingStatus
}) {
  const style =
    status === 'CONFIRMED'
      ? 'bg-blue-100 text-blue-700'
      : status === 'COMPLETED'
        ? 'bg-green-100 text-green-700'
        : status === 'CANCELLED'
          ? 'bg-red-100 text-red-700'
          : 'bg-yellow-100 text-yellow-700'

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${style}`}
    >
      {status}
    </span>
  )
}

export default AdminBookingsPage