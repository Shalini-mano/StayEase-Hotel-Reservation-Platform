import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'

import api from '../api/axios'
import type { AppDispatch } from '../app/store'
import { logout } from '../features/auth/authSlice'

interface Booking {
  id: string
  hotelId: string
  roomId: string
  checkIn: string
  checkOut: string
  guests: number
  numberOfNights: number
  totalPrice: number
  status: string
  createdAt: string
}

interface Hotel {
  id: string
  name: string
  city: string
  country: string
}

interface Room {
  id: string
  roomNumber: string
  roomType: string
}

interface EnrichedBooking extends Booking {
  hotelName: string
  hotelCity: string
  hotelCountry: string
  roomNumber: string
  roomType: string
}

interface CustomerDashboard {
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  completedBookings: number
  cancelledBookings: number
  totalSpent: number
  recentBookings: Booking[]
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function CustomerDashboardPage() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const [dashboard, setDashboard] =
    useState<CustomerDashboard | null>(null)

  const [recentBookings, setRecentBookings] =
    useState<EnrichedBooking[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const fetchHotel = async (
    hotelId: string,
  ): Promise<Hotel | null> => {
    try {
      const response =
        await api.get<ApiResponse<Hotel>>(
          `/api/hotels/${hotelId}`,
        )

      return response.data.data
    } catch (err) {
      console.error(
        'Failed to load hotel:',
        err,
      )

      return null
    }
  }

  const fetchRoom = async (
    roomId: string,
  ): Promise<Room | null> => {
    try {
      const response =
        await api.get<ApiResponse<Room>>(
          `/api/rooms/${roomId}`,
        )

      return response.data.data
    } catch (err) {
      console.error(
        'Failed to load room:',
        err,
      )

      return null
    }
  }

  const enrichBookings = async (
    bookings: Booking[],
  ) => {
    const enriched =
      await Promise.all(
        bookings.map(
          async (
            booking,
          ): Promise<EnrichedBooking> => {
            const [hotel, room] =
              await Promise.all([
                fetchHotel(
                  booking.hotelId,
                ),
                fetchRoom(
                  booking.roomId,
                ),
              ])

            return {
              ...booking,

              hotelName:
                hotel?.name ||
                'Hotel',

              hotelCity:
                hotel?.city ||
                '',

              hotelCountry:
                hotel?.country ||
                '',

              roomNumber:
                room?.roomNumber ||
                '',

              roomType:
                room?.roomType ||
                'Not available',
            }
          },
        ),
      )

    return enriched
  }

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      setError('')

      const response =
        await api.get<
          ApiResponse<CustomerDashboard>
        >(
          '/api/customer/dashboard',
        )

      const dashboardData =
        response.data.data

      setDashboard(dashboardData)

      const enriched =
        await enrichBookings(
          dashboardData.recentBookings,
        )

      setRecentBookings(enriched)
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to load dashboard',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">

        <p className="text-lg text-gray-600">
          Loading dashboard...
        </p>

      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">

        <div className="rounded-xl bg-white p-6 text-center shadow">

          <p className="mb-4 text-red-600">
            {error ||
              'Unable to load dashboard'}
          </p>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
          >
            Back to Login
          </button>

        </div>

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}

      <header className="bg-white shadow-sm">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div>

            <h1 className="text-2xl font-bold text-blue-600">
              StayEase
            </h1>

            <p className="text-sm text-gray-500">
              Customer Dashboard
            </p>

          </div>

          <div className="flex flex-wrap items-center gap-3">

            <Link
              to="/hotels/search"
              className="rounded-lg bg-green-600 px-5 py-2 font-medium text-white hover:bg-green-700"
            >
              Search Hotels
            </Link>

            <Link
              to="/bookings"
              className="rounded-lg bg-purple-600 px-5 py-2 font-medium text-white hover:bg-purple-700"
            >
              My Bookings
            </Link>

            <Link
              to="/notifications"
              className="rounded-lg bg-orange-500 px-5 py-2 font-medium text-white hover:bg-orange-600"
            >
              Notifications
            </Link>

            <Link
              to="/profile"
              className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
            >
              Profile
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-5 py-2 font-medium text-white hover:bg-red-700"
            >
              Logout
            </button>

          </div>

        </div>

      </header>

      {/* MAIN */}

      <main className="mx-auto max-w-7xl px-6 py-8">

        <div className="mb-8">

          <h2 className="text-3xl font-bold text-gray-800">
            My Dashboard
          </h2>

          <p className="mt-1 text-gray-500">
            Manage your bookings and reservations.
          </p>

        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* DASHBOARD CARDS */}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">

          <DashboardCard
            title="Total Bookings"
            value={
              dashboard.totalBookings
            }
          />

          <DashboardCard
            title="Pending"
            value={
              dashboard.pendingBookings
            }
          />

          <DashboardCard
            title="Confirmed"
            value={
              dashboard.confirmedBookings
            }
          />

          <DashboardCard
            title="Completed"
            value={
              dashboard.completedBookings
            }
          />

          <DashboardCard
            title="Cancelled"
            value={
              dashboard.cancelledBookings
            }
          />

          <DashboardCard
            title="Total Spent"
            value={`€${dashboard.totalSpent.toFixed(
              2,
            )}`}
          />

        </div>

        {/* RECENT BOOKINGS */}

        <div className="rounded-xl bg-white p-6 shadow">

          <div className="mb-6 flex items-center justify-between">

            <div>

              <h3 className="text-xl font-semibold text-gray-800">
                Recent Bookings
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Your latest hotel reservations
              </p>

            </div>

            <Link
              to="/bookings"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View All
            </Link>

          </div>

          {recentBookings.length === 0 ? (
            <div className="py-8 text-center">

              <p className="text-gray-500">
                No bookings found.
              </p>

              <Link
                to="/hotels/search"
                className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
              >
                Find a Hotel
              </Link>

            </div>
          ) : (
            <div className="space-y-5">

              {recentBookings.map(
                (booking) => (
                  <div
                    key={booking.id}
                    className="rounded-xl border border-gray-200 p-5"
                  >

                    {/* BOOKING HEADER */}

                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">

                      <div>

                        <h4 className="text-lg font-bold text-gray-900">
                          {booking.hotelName}
                        </h4>

                        {(booking.hotelCity ||
                          booking.hotelCountry) && (
                          <p className="mt-1 text-sm text-gray-500">

                            {
                              booking.hotelCity
                            }

                            {booking.hotelCountry
                              ? `${
                                  booking.hotelCity
                                    ? ', '
                                    : ''
                                }${booking.hotelCountry}`
                              : ''}

                          </p>
                        )}

                        <p className="mt-2 text-sm text-gray-500">
                          {booking.checkIn}{' '}
                          →{' '}
                          {
                            booking.checkOut
                          }
                        </p>

                      </div>

                      <BookingStatus
                        status={
                          booking.status
                        }
                      />

                    </div>

                    {/* BOOKING INFO */}

                    <div className="mt-5 grid grid-cols-2 gap-4 text-sm md:grid-cols-5">

                      <BookingInfo
                        label="Room"
                        value={
                          booking.roomNumber
                            ? `Room ${booking.roomNumber}`
                            : 'Not available'
                        }
                      />

                      <BookingInfo
                        label="Room Type"
                        value={
                          booking.roomType
                        }
                      />

                      <BookingInfo
                        label="Guests"
                        value={
                          booking.guests
                        }
                      />

                      <BookingInfo
                        label="Nights"
                        value={
                          booking.numberOfNights
                        }
                      />

                      <BookingInfo
                        label="Total"
                        value={`€${booking.totalPrice.toFixed(
                          2,
                        )}`}
                        strong
                      />

                    </div>

                    {/* STATUS MESSAGE */}

                    {booking.status ===
                      'PENDING' && (
                      <div className="mt-5 rounded-lg border border-yellow-200 bg-yellow-50 p-3">

                        <p className="text-sm font-medium text-yellow-800">
                          Payment is required to confirm this booking.
                        </p>

                      </div>
                    )}

                    {booking.status ===
                      'CONFIRMED' && (
                      <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-3">

                        <p className="text-sm font-medium text-green-800">
                          ✓ Your reservation is confirmed.
                        </p>

                      </div>
                    )}

                    {booking.status ===
                      'COMPLETED' && (
                      <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-3">

                        <p className="text-sm font-medium text-blue-800">
                          Your stay is completed. You can now leave a review.
                        </p>

                      </div>
                    )}

                    {booking.status ===
                      'CANCELLED' && (
                      <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3">

                        <p className="text-sm font-medium text-red-800">
                          This reservation was cancelled.
                        </p>

                      </div>
                    )}

                    {/* ACTIONS */}

                    <div className="mt-5 flex flex-wrap gap-3">

                      <Link
                        to={`/bookings/${booking.id}`}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        View Details
                      </Link>

                      {booking.status ===
                        'PENDING' && (
                        <Link
                          to={`/bookings/${booking.id}`}
                          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                        >
                          Pay Now
                        </Link>
                      )}

                      {booking.status ===
                        'COMPLETED' && (
                       <Link
                         to={`/bookings/${booking.id}/review`}
                         className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700"
                       >
                         Write Review
                       </Link>
                      )}

                    </div>

                  </div>
                ),
              )}

            </div>
          )}

        </div>

      </main>

    </div>
  )
}

interface DashboardCardProps {
  title: string
  value: string | number
}

function DashboardCard({
  title,
  value,
}: DashboardCardProps) {
  return (
    <div className="rounded-xl bg-white p-5 shadow">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-gray-800">
        {value}
      </p>

    </div>
  )
}

interface BookingInfoProps {
  label: string
  value: string | number
  strong?: boolean
}

function BookingInfo({
  label,
  value,
  strong = false,
}: BookingInfoProps) {
  return (
    <div>

      <p className="text-gray-500">
        {label}
      </p>

      <p
        className={`mt-1 ${
          strong
            ? 'font-bold text-blue-700'
            : 'font-medium text-gray-800'
        }`}
      >
        {value}
      </p>

    </div>
  )
}

interface BookingStatusProps {
  status: string
}

function BookingStatus({
  status,
}: BookingStatusProps) {
  let style =
    'bg-gray-100 text-gray-700'

  if (status === 'CONFIRMED') {
    style =
      'bg-green-100 text-green-700'
  }

  if (status === 'PENDING') {
    style =
      'bg-yellow-100 text-yellow-700'
  }

  if (status === 'CANCELLED') {
    style =
      'bg-red-100 text-red-700'
  }

  if (status === 'COMPLETED') {
    style =
      'bg-blue-100 text-blue-700'
  }

  return (
    <span
      className={`h-fit rounded-full px-3 py-1 text-sm font-semibold ${style}`}
    >
      {status}
    </span>
  )
}

export default CustomerDashboardPage