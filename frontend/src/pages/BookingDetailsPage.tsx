import { useEffect, useState } from 'react'
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'
import api from '../api/axios'

interface Booking {
  id: string
  userId: string
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
  address?: string
}

interface Room {
  id: string
  roomNumber: string
  roomType: string
  description?: string
  capacity?: number
}

interface Review {
  id: string
  hotelId: string
  userId: string
  bookingId: string
  rating: number
  comment: string
  createdAt: string
  updatedAt: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function BookingDetailsPage() {
  const { bookingId } = useParams()
  const navigate = useNavigate()

  const [booking, setBooking] =
    useState<Booking | null>(null)

  const [hotel, setHotel] =
    useState<Hotel | null>(null)

  const [room, setRoom] =
    useState<Room | null>(null)

  const [existingReview, setExistingReview] =
    useState<Review | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  const [paying, setPaying] =
    useState(false)

  const [cancelling, setCancelling] =
    useState(false)

  const [rating, setRating] =
    useState(5)

  const [comment, setComment] =
    useState('')

  const [
    reviewSubmitting,
    setReviewSubmitting,
  ] = useState(false)

  const [
    editingReview,
    setEditingReview,
  ] = useState(false)

  const [
    deletingReview,
    setDeletingReview,
  ] = useState(false)

  const fetchHotel = async (
    hotelId: string,
  ) => {
    try {
      const response =
        await api.get<
          ApiResponse<Hotel>
        >(`/api/hotels/${hotelId}`)

      setHotel(response.data.data)
    } catch (err) {
      console.error(
        'Failed to load hotel:',
        err,
      )

      setHotel(null)
    }
  }

  const fetchRoom = async (
    roomId: string,
  ) => {
    try {
      const response =
        await api.get<
          ApiResponse<Room>
        >(`/api/rooms/${roomId}`)

      setRoom(response.data.data)
    } catch (err) {
      console.error(
        'Failed to load room:',
        err,
      )

      setRoom(null)
    }
  }

  const fetchReviewsForBooking =
    async (
      currentBooking: Booking,
    ) => {
      try {
        const response =
          await api.get<
            ApiResponse<Review[]>
          >(
            `/api/reviews/hotel/${currentBooking.hotelId}`,
          )

        const review =
          response.data.data.find(
            (item) =>
              item.bookingId ===
              currentBooking.id,
          ) || null

        setExistingReview(review)

        if (review) {
          setRating(review.rating)
          setComment(review.comment)
        } else {
          setRating(5)
          setComment('')
        }
      } catch (err) {
        console.error(
          'Failed to load review:',
          err,
        )
      }
    }

  const fetchBooking = async () => {
    if (!bookingId) {
      setError(
        'Booking information is missing.',
      )

      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')

      const response =
        await api.get<
          ApiResponse<Booking>
        >(
          `/api/bookings/${bookingId}`,
        )

      const currentBooking =
        response.data.data

      setBooking(currentBooking)

      await Promise.all([
        fetchHotel(
          currentBooking.hotelId,
        ),

        fetchRoom(
          currentBooking.roomId,
        ),

        fetchReviewsForBooking(
          currentBooking,
        ),
      ])
    } catch (err: any) {
      console.error(
        'Failed to load booking:',
        err,
      )

      setBooking(null)

      setError(
        err.response?.data?.message ||
          'Failed to load booking details',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (bookingId) {
      fetchBooking()
    } else {
      setError(
        'Booking information is missing.',
      )

      setLoading(false)
    }
  }, [bookingId])

  const handlePayment = async () => {
    if (!booking) {
      return
    }

    try {
      setPaying(true)
      setError('')
      setSuccess('')

      await api.post(
        '/api/payments',
        {
          bookingId: booking.id,
          paymentMethod: 'CARD',
        },
      )

      navigate(
        '/payment/success',
        {
          state: {
            bookingId:
              booking.id,

            totalPrice:
              booking.totalPrice,
          },
        },
      )
    } catch (err: any) {
      console.error(
        'Payment failed:',
        err,
      )

      setError(
        err.response?.data?.message ||
          'Payment failed. Please try again.',
      )
    } finally {
      setPaying(false)
    }
  }

  const handleCancel = async () => {
    if (!booking) {
      return
    }

    const confirmed =
      window.confirm(
        'Are you sure you want to cancel this booking?',
      )

    if (!confirmed) {
      return
    }

    try {
      setCancelling(true)
      setError('')
      setSuccess('')

      await api.patch(
        `/api/bookings/${booking.id}/cancel`,
      )

      setSuccess(
        'Booking cancelled successfully',
      )

      await fetchBooking()
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to cancel booking',
      )
    } finally {
      setCancelling(false)
    }
  }

  const handleReviewSubmit =
    async () => {
      if (!booking) {
        return
      }

      if (!comment.trim()) {
        setError(
          'Please enter a review comment.',
        )

        return
      }

      try {
        setReviewSubmitting(true)
        setError('')
        setSuccess('')

        await api.post(
          '/api/reviews',
          {
            hotelId:
              booking.hotelId,

            bookingId:
              booking.id,

            rating,
            comment,
          },
        )

        setSuccess(
          'Review submitted successfully',
        )

        await fetchReviewsForBooking(
          booking,
        )
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            'Failed to submit review',
        )
      } finally {
        setReviewSubmitting(false)
      }
    }

  const handleUpdateReview =
    async () => {
      if (
        !booking ||
        !existingReview
      ) {
        return
      }

      if (!comment.trim()) {
        setError(
          'Please enter a review comment.',
        )

        return
      }

      try {
        setReviewSubmitting(true)
        setError('')
        setSuccess('')

        await api.put(
          `/api/reviews/${existingReview.id}`,
          {
            hotelId:
              booking.hotelId,

            bookingId:
              booking.id,

            rating,
            comment,
          },
        )

        setSuccess(
          'Review updated successfully',
        )

        setEditingReview(false)

        await fetchReviewsForBooking(
          booking,
        )
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            'Failed to update review',
        )
      } finally {
        setReviewSubmitting(false)
      }
    }

  const handleDeleteReview =
    async () => {
      if (
        !booking ||
        !existingReview
      ) {
        return
      }

      const confirmed =
        window.confirm(
          'Are you sure you want to delete this review?',
        )

      if (!confirmed) {
        return
      }

      try {
        setDeletingReview(true)
        setError('')
        setSuccess('')

        await api.delete(
          `/api/reviews/${existingReview.id}`,
        )

        setExistingReview(null)
        setEditingReview(false)
        setRating(5)
        setComment('')

        setSuccess(
          'Review deleted successfully',
        )
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            'Failed to delete review',
        )
      } finally {
        setDeletingReview(false)
      }
    }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">
          Loading booking...
        </p>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">

        <div className="rounded-xl bg-white p-6 shadow">

          <p className="text-red-600">
            {error ||
              'Booking not found'}
          </p>

          <Link
            to="/bookings"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Back to My Bookings
          </Link>

        </div>

      </div>
    )
  }

  const canCancel =
    (booking.status ===
      'PENDING' ||
      booking.status ===
        'CONFIRMED') &&
    new Date(
      booking.checkIn,
    ) > new Date()

  const canReview =
    booking.status !==
      'CANCELLED' &&
    new Date(
      booking.checkOut,
    ) < new Date()

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}

      <header className="bg-white shadow-sm">

        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">

          <div>

            <h1 className="text-2xl font-bold text-blue-600">
              StayEase
            </h1>

            <p className="text-sm text-gray-500">
              Booking Details
            </p>

          </div>

          <Link
            to="/bookings"
            className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
          >
            Back to My Bookings
          </Link>

        </div>

      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg bg-green-100 p-4 text-green-700">
            {success}
          </div>
        )}

        <div className="rounded-xl bg-white p-6 shadow">

          {/* BOOKING HEADER */}

          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row">

            <div>

              <h2 className="text-2xl font-bold">
                {hotel?.name ||
                  'Hotel Booking'}
              </h2>

              {hotel && (
                <p className="mt-1 text-gray-500">
                  {hotel.city}
                  {hotel.country
                    ? `, ${hotel.country}`
                    : ''}
                </p>
              )}

              <p className="mt-2 text-sm text-gray-500">
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

          {/* DETAILS */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <Detail
              label="Hotel"
              value={
                hotel?.name ||
                'Hotel information unavailable'
              }
            />

            <Detail
              label="Location"
              value={
                hotel
                  ? `${hotel.city}${
                      hotel.country
                        ? `, ${hotel.country}`
                        : ''
                    }`
                  : 'Location unavailable'
              }
            />

            <Detail
              label="Room"
              value={
                room?.roomNumber
                  ? `Room ${room.roomNumber}`
                  : 'Room information unavailable'
              }
            />

            <Detail
              label="Room Type"
              value={
                room?.roomType ||
                'Room type unavailable'
              }
            />

            <Detail
              label="Check-in"
              value={
                booking.checkIn
              }
            />

            <Detail
              label="Check-out"
              value={
                booking.checkOut
              }
            />

            <Detail
              label="Guests"
              value={
                booking.guests
              }
            />

            <Detail
              label="Number of Nights"
              value={
                booking.numberOfNights
              }
            />

            <Detail
              label="Price per Night"
              value={`€${booking.pricePerNight.toFixed(
                2,
              )}`}
            />

            <Detail
              label="Total Price"
              value={`€${booking.totalPrice.toFixed(
                2,
              )}`}
            />

          </div>

          {/* PAYMENT */}

          {booking.status ===
            'PENDING' && (
            <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-5">

              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div>

                  <h3 className="text-lg font-bold text-gray-900">
                    Payment Required
                  </h3>

                  <p className="mt-1 text-sm text-gray-600">
                    Complete payment to confirm your booking.
                  </p>

                  <p className="mt-2 text-xl font-bold text-blue-700">
                    €
                    {booking.totalPrice.toFixed(
                      2,
                    )}
                  </p>

                </div>

                <button
                  onClick={
                    handlePayment
                  }
                  disabled={
                    paying
                  }
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {paying
                    ? 'Processing Payment...'
                    : 'Pay Now'}
                </button>

              </div>

            </div>
          )}

          {/* CONFIRMED */}

          {booking.status ===
            'CONFIRMED' && (
            <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-5">

              <h3 className="font-bold text-green-800">
                ✓ Booking Confirmed
              </h3>

              <p className="mt-1 text-sm text-green-700">
                Your payment has been completed and your reservation is confirmed.
              </p>

            </div>
          )}

          {/* COMPLETED */}

          {booking.status ===
            'COMPLETED' && (
            <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-5">

              <h3 className="font-bold text-blue-800">
                Stay Completed
              </h3>

              <p className="mt-1 text-sm text-blue-700">
                We hope you enjoyed your stay. You can leave a review below.
              </p>

            </div>
          )}

          {/* CANCEL */}

          {canCancel && (
            <div className="mt-8">

              <button
                onClick={
                  handleCancel
                }
                disabled={
                  cancelling
                }
                className="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700 disabled:bg-gray-400"
              >
                {cancelling
                  ? 'Cancelling...'
                  : 'Cancel Booking'}
              </button>

            </div>
          )}

          {/* REVIEW */}

          {canReview && (
            <div className="mt-10 border-t pt-8">

              <h3 className="mb-5 text-xl font-semibold">
                Your Review
              </h3>

              {existingReview &&
                !editingReview && (
                  <div className="rounded-lg border bg-gray-50 p-5">

                    <div className="flex gap-1">

                      {[1, 2, 3, 4, 5].map(
                        (star) => (
                          <span
                            key={star}
                            className={
                              star <=
                              existingReview.rating
                                ? 'text-2xl text-yellow-500'
                                : 'text-2xl text-gray-300'
                            }
                          >
                            ★
                          </span>
                        ),
                      )}

                    </div>

                    <p className="mt-4 text-gray-700">
                      {
                        existingReview.comment
                      }
                    </p>

                    <p className="mt-3 text-sm text-gray-500">
                      Rating:{' '}
                      {
                        existingReview.rating
                      }
                      /5
                    </p>

                    <div className="mt-5 flex gap-3">

                      <button
                        onClick={() =>
                          setEditingReview(
                            true,
                          )
                        }
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                      >
                        Edit Review
                      </button>

                      <button
                        onClick={
                          handleDeleteReview
                        }
                        disabled={
                          deletingReview
                        }
                        className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:bg-gray-400"
                      >
                        {deletingReview
                          ? 'Deleting...'
                          : 'Delete Review'}
                      </button>

                    </div>

                  </div>
                )}

              {(!existingReview ||
                editingReview) && (
                <div>

                  <div className="mb-5">

                    <label className="mb-2 block text-sm font-medium">
                      Rating
                    </label>

                    <select
                      value={rating}
                      onChange={(event) =>
                        setRating(
                          Number(
                            event.target
                              .value,
                          ),
                        )
                      }
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2"
                    >
                      <option value={5}>
                        5 - Excellent
                      </option>

                      <option value={4}>
                        4 - Very Good
                      </option>

                      <option value={3}>
                        3 - Good
                      </option>

                      <option value={2}>
                        2 - Fair
                      </option>

                      <option value={1}>
                        1 - Poor
                      </option>
                    </select>

                  </div>

                  <div className="mb-5">

                    <label className="mb-2 block text-sm font-medium">
                      Comment
                    </label>

                    <textarea
                      value={
                        comment
                      }
                      onChange={(event) =>
                        setComment(
                          event.target
                            .value,
                        )
                      }
                      rows={4}
                      placeholder="Tell us about your stay..."
                      className="w-full rounded-lg border border-gray-300 px-4 py-3"
                    />

                  </div>

                  <div className="flex gap-3">

                    <button
                      onClick={
                        existingReview
                          ? handleUpdateReview
                          : handleReviewSubmit
                      }
                      disabled={
                        reviewSubmitting
                      }
                      className="rounded-lg bg-purple-600 px-5 py-2 text-white hover:bg-purple-700 disabled:bg-gray-400"
                    >
                      {reviewSubmitting
                        ? 'Saving...'
                        : existingReview
                          ? 'Update Review'
                          : 'Submit Review'}
                    </button>

                    {editingReview && (
                      <button
                        onClick={() => {
                          setEditingReview(
                            false,
                          )

                          setRating(
                            existingReview
                              ?.rating ||
                              5,
                          )

                          setComment(
                            existingReview
                              ?.comment ||
                              '',
                          )
                        }}
                        className="rounded-lg bg-gray-300 px-5 py-2 text-gray-800 hover:bg-gray-400"
                      >
                        Cancel Edit
                      </button>
                    )}

                  </div>

                </div>
              )}

            </div>
          )}

        </div>

      </main>

    </div>
  )
}

interface DetailProps {
  label: string
  value: string | number
}

function Detail({
  label,
  value,
}: DetailProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-gray-900">
        {value}
      </p>

    </div>
  )
}

function BookingStatus({
  status,
}: {
  status: string
}) {
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

export default BookingDetailsPage