import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import api from '../api/axios'

interface ManagerBooking {
  id: string
  customerName?: string
  customerEmail?: string
  hotelName?: string
  roomNumber?: string
  checkIn: string
  checkOut: string
  guests: number
  totalPrice: number
  status: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function ManagerBookingsPage() {
  const [bookings, setBookings] = useState<ManagerBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchBookings = async () => {
    try {
      setError('')

      const response =
        await api.get<ApiResponse<ManagerBooking[]>>(
          '/api/manager/bookings',
        )

      setBookings(response.data.data)
    } catch (err: any) {
      console.error(
        'Failed to load manager bookings:',
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
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">
          Loading bookings...
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
              Manager Bookings
            </p>
          </div>

          <Link
            to="/manager/dashboard"
            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
          >
            Dashboard
          </Link>

        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">

        <h2 className="mb-6 text-3xl font-bold text-gray-800">
          Hotel Bookings
        </h2>

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow">
            <p className="text-gray-500">
              No bookings found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl bg-white shadow">

            <table className="min-w-full">

              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                    Customer
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                    Hotel
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                    Room
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                    Check-in
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                    Check-out
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                    Guests
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                    Total
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">

                {bookings.map((booking) => (
                  <tr key={booking.id}>

                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-800">
                        {booking.customerName || '-'}
                      </div>

                      <div className="text-sm text-gray-500">
                        {booking.customerEmail || ''}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {booking.hotelName || '-'}
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {booking.roomNumber || '-'}
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {booking.checkIn}
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {booking.checkOut}
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {booking.guests}
                    </td>

                    <td className="px-5 py-4 font-medium text-gray-800">
                      €{Number(
                        booking.totalPrice || 0,
                      ).toFixed(2)}
                    </td>

                    <td className="px-5 py-4">
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

      </main>
    </div>
  )
}

function StatusBadge({
  status,
}: {
  status: string
}) {
  let style =
    'bg-gray-100 text-gray-700'

  if (status === 'PENDING') {
    style =
      'bg-yellow-100 text-yellow-700'
  }

  if (status === 'CONFIRMED') {
    style =
      'bg-green-100 text-green-700'
  }

  if (status === 'COMPLETED') {
    style =
      'bg-blue-100 text-blue-700'
  }

  if (status === 'CANCELLED') {
    style =
      'bg-red-100 text-red-700'
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-medium ${style}`}
    >
      {status}
    </span>
  )
}

export default ManagerBookingsPage