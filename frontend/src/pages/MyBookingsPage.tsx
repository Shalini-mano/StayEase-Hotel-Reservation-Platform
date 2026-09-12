import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

interface Booking {
  id: string
  hotelId: string
  roomId: string
  checkIn: string
  checkOut: string
  guests: number
  numberOfNights: number
  pricePerNight: number
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

interface BookingDisplay extends Booking {
  hotelName?: string
  hotelCity?: string
  hotelCountry?: string
  roomNumber?: string
  roomType?: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function MyBookingsPage() {
  const [bookings, setBookings] =
    useState<BookingDisplay[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [
    cancellingId,
    setCancellingId,
  ] = useState<string | null>(null)

  const getHotelDetails = async (
    hotelId: string,
  ) => {
    try {
      const response =
        await api.get<
          ApiResponse<Hotel>
        >(
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

  const getRoomDetails = async (
    roomId: string,
  ) => {
    try {
      const response =
        await api.get<
          ApiResponse<Room>
        >(
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

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError('')

      const response =
        await api.get<
          ApiResponse<Booking[]>
        >(
          '/api/bookings/my',
        )

      const bookingData =
        response.data.data

      const enrichedBookings =
        await Promise.all(
          bookingData.map(
            async (
              booking,
            ): Promise<BookingDisplay> => {
              const [
                hotel,
                room,
              ] =
                await Promise.all([
                  getHotelDetails(
                    booking.hotelId,
                  ),

                  getRoomDetails(
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
                  '',
              }
            },
          ),
        )

      enrichedBookings.sort(
        (a, b) =>
          new Date(
            b.createdAt,
          ).getTime() -
          new Date(
            a.createdAt,
          ).getTime(),
      )

      setBookings(
        enrichedBookings,
      )
    } catch (err: any) {
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

  const handleCancel = async (
    bookingId: string,
  ) => {
    const confirmed =
      window.confirm(
        'Are you sure you want to cancel this booking?',
      )

    if (!confirmed) {
      return
    }

    try {
      setCancellingId(
        bookingId,
      )

      setError('')

      await api.patch(
        `/api/bookings/${bookingId}/cancel`,
      )

      await fetchBookings()
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to cancel booking',
      )
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">

        <p className="text-gray-600">
          Loading bookings...
        </p>

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
              My Bookings
            </p>

          </div>

          <Link
            to="/customer/dashboard"
            className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>

        </div>

      </header>

      {/* MAIN */}

      <main className="mx-auto max-w-7xl px-6 py-8">

        <div className="mb-7">

          <h2 className="text-3xl font-bold text-gray-800">
            Booking History
          </h2>

          <p className="mt-1 text-gray-500">
            View and manage all your hotel reservations.
          </p>

        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow">

            <h3 className="text-xl font-semibold text-gray-800">
              No bookings yet
            </h3>

            <p className="mt-2 text-gray-500">
              Search for a hotel and make your first reservation.
            </p>

            <Link
              to="/hotels/search"
              className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
            >
              Search Hotels
            </Link>

          </div>
        ) : (
          <div className="space-y-6">

            {bookings.map(
              (booking) => {

                const canCancel =
                  (booking.status ===
                    'PENDING' ||
                    booking.status ===
                      'CONFIRMED') &&
                  new Date(
                    booking.checkIn,
                  ) >
                    new Date()

                return (
                  <div
                    key={
                      booking.id
                    }
                    className="overflow-hidden rounded-xl bg-white shadow"
                  >

                    {/* TOP */}

                    <div className="border-b border-gray-100 p-6">

                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">

                        <div>

                          <h3 className="text-xl font-bold text-gray-900">
                            {booking.hotelName}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">

                            {booking.hotelCity}

                            {booking.hotelCountry
                              ? `, ${booking.hotelCountry}`
                              : ''}

                          </p>

                          <p className="mt-3 text-sm text-gray-500">
                            {booking.createdAt
                              ? `Booked on ${new Date(
                                  booking.createdAt,
                                ).toLocaleString()}`
                              : ''}
                          </p>

                        </div>

                        <BookingStatus
                          status={
                            booking.status
                          }
                        />

                      </div>

                    </div>

                    {/* DETAILS */}

                    <div className="p-6">

                      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">

                        <BookingDetail
                          label="Check-in"
                          value={
                            booking.checkIn
                          }
                        />

                        <BookingDetail
                          label="Check-out"
                          value={
                            booking.checkOut
                          }
                        />

                        <BookingDetail
                          label="Guests"
                          value={
                            booking.guests
                          }
                        />

                        <BookingDetail
                          label="Nights"
                          value={
                            booking.numberOfNights
                          }
                        />

                        <BookingDetail
                          label="Room"
                          value={
                            booking.roomNumber
                              ? `Room ${booking.roomNumber}`
                              : 'Room'
                          }
                        />

                        <BookingDetail
                          label="Room Type"
                          value={
                            booking.roomType ||
                            'Not available'
                          }
                        />

                        <BookingDetail
                          label="Price / Night"
                          value={`€${booking.pricePerNight.toFixed(
                            2,
                          )}`}
                        />

                        <BookingDetail
                          label="Total"
                          value={`€${booking.totalPrice.toFixed(
                            2,
                          )}`}
                          strong
                        />

                      </div>

                      {/* PENDING */}

                      {booking.status ===
                        'PENDING' && (
                        <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">

                          <p className="font-semibold text-yellow-800">
                            Payment Pending
                          </p>

                          <p className="mt-1 text-sm text-yellow-700">
                            Complete your payment to confirm this reservation.
                          </p>

                        </div>
                      )}

                      {/* CONFIRMED */}

                      {booking.status ===
                        'CONFIRMED' && (
                        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">

                          <p className="font-semibold text-green-800">
                            ✓ Reservation Confirmed
                          </p>

                          <p className="mt-1 text-sm text-green-700">
                            Your payment has been completed and your room is reserved.
                          </p>

                        </div>
                      )}

                      {/* COMPLETED */}

                      {booking.status ===
                        'COMPLETED' && (
                        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">

                          <p className="font-semibold text-blue-800">
                            Stay Completed
                          </p>

                          <p className="mt-1 text-sm text-blue-700">
                            We hope you enjoyed your stay.
                          </p>

                        </div>
                      )}

                      {/* CANCELLED */}

                      {booking.status ===
                        'CANCELLED' && (
                        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">

                          <p className="font-semibold text-red-800">
                            Booking Cancelled
                          </p>

                          <p className="mt-1 text-sm text-red-700">
                            This reservation has been cancelled.
                          </p>

                        </div>
                      )}

                      {/* ACTIONS */}

                      <div className="mt-6 flex flex-wrap gap-3">

                        <Link
                          to={`/bookings/${booking.id}`}
                          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                        >
                          View Details
                        </Link>

                        {booking.status ===
                          'PENDING' && (
                          <Link
                            to={`/bookings/${booking.id}`}
                            className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
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

                        {canCancel && (
                          <button
                            onClick={() =>
                              handleCancel(
                                booking.id,
                              )
                            }
                            disabled={
                              cancellingId ===
                              booking.id
                            }
                            className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:bg-gray-400"
                          >
                            {cancellingId ===
                            booking.id
                              ? 'Cancelling...'
                              : 'Cancel Booking'}
                          </button>
                        )}

                      </div>

                    </div>

                  </div>
                )
              },
            )}

          </div>
        )}

      </main>

    </div>
  )
}

interface BookingDetailProps {
  label: string
  value: string | number
  strong?: boolean
}

function BookingDetail({
  label,
  value,
  strong = false,
}: BookingDetailProps) {
  return (
    <div>

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p
        className={`mt-1 ${
          strong
            ? 'text-lg font-bold text-blue-700'
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

export default MyBookingsPage