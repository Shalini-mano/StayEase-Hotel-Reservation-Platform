import { useEffect, useState } from 'react'
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'

import api from '../api/axios'

interface Booking {
  id: string
  hotelId: string
  roomId: string
  checkIn: string
  checkOut: string
  status: string
}

interface Hotel {
  id: string
  name: string
  city: string
  country: string
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

function WriteReviewPage() {
  const { bookingId } = useParams()
  const navigate = useNavigate()

  const [booking, setBooking] =
    useState<Booking | null>(null)

  const [hotel, setHotel] =
    useState<Hotel | null>(null)

  const [existingReview, setExistingReview] =
    useState<Review | null>(null)

  const [rating, setRating] =
    useState(5)

  const [comment, setComment] =
    useState('')

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  useEffect(() => {
    const loadPage = async () => {
      if (!bookingId) {
        setError('Booking information is missing.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const bookingResponse =
          await api.get<
            ApiResponse<Booking>
          >(
            `/api/bookings/${bookingId}`,
          )

        const bookingData =
          bookingResponse.data.data

        setBooking(bookingData)

        const hotelResponse =
          await api.get<
            ApiResponse<Hotel>
          >(
            `/api/hotels/${bookingData.hotelId}`,
          )

        setHotel(
          hotelResponse.data.data,
        )

        const reviewResponse =
          await api.get<
            ApiResponse<Review[]>
          >(
            `/api/reviews/hotel/${bookingData.hotelId}`,
          )

        const review =
          reviewResponse.data.data.find(
            (item) =>
              item.bookingId ===
              bookingData.id,
          ) || null

        setExistingReview(review)

        if (review) {
          setRating(review.rating)
          setComment(review.comment)
        }
      } catch (err: any) {
        console.error(
          'Failed to load review page:',
          err,
        )

        setError(
          err.response?.data?.message ||
            'Failed to load review information',
        )
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [bookingId])

  const handleSubmit = async () => {
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
      setSaving(true)
      setError('')
      setSuccess('')

      if (existingReview) {
        const response =
          await api.put<
            ApiResponse<Review>
          >(
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

        setExistingReview(
          response.data.data,
        )

        setSuccess(
          'Review updated successfully.',
        )
      } else {
        const response =
          await api.post<
            ApiResponse<Review>
          >(
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

        setExistingReview(
          response.data.data,
        )

        setSuccess(
          'Review submitted successfully.',
        )
      }

      setTimeout(() => {
        navigate(
          `/bookings/${booking.id}`,
        )
      }, 1200)
    } catch (err: any) {
      console.error(
        'Review save failed:',
        err,
      )

      setError(
        err.response?.data?.message ||
          'Failed to save review',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">
          Loading review...
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
            className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            Back to My Bookings
          </Link>

        </div>

      </div>
    )
  }

  const reviewAllowed =
    booking.status !==
      'CANCELLED' &&
    new Date(
      booking.checkOut,
    ) < new Date()

  if (!reviewAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">

        <div className="max-w-lg rounded-xl bg-white p-8 text-center shadow">

          <h1 className="text-2xl font-bold text-gray-900">
            Review not available yet
          </h1>

          <p className="mt-3 text-gray-600">
            You can review this hotel after your stay is completed.
          </p>

          <Link
            to={`/bookings/${booking.id}`}
            className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 text-white"
          >
            Back to Booking
          </Link>

        </div>

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <header className="bg-white shadow-sm">

        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">

          <div>

            <h1 className="text-2xl font-bold text-blue-600">
              StayEase
            </h1>

            <p className="text-sm text-gray-500">
              Write Review
            </p>

          </div>

          <Link
            to={`/bookings/${booking.id}`}
            className="rounded-lg bg-gray-600 px-5 py-2 text-white hover:bg-gray-700"
          >
            Back
          </Link>

        </div>

      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">

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

        <div className="rounded-xl bg-white p-8 shadow">

          <div className="mb-7">

            <p className="text-sm font-medium text-blue-600">
              Your stay
            </p>

            <h2 className="mt-1 text-3xl font-bold text-gray-900">
              {hotel?.name ||
                'Hotel Review'}
            </h2>

            {hotel && (
              <p className="mt-2 text-gray-500">
                {hotel.city}, {hotel.country}
              </p>
            )}

            <p className="mt-3 text-sm text-gray-500">
              {booking.checkIn} → {booking.checkOut}
            </p>

          </div>

          <div className="border-t border-gray-200 pt-6">

            <label className="block text-sm font-semibold text-gray-700">
              Rating
            </label>

            <div className="mt-3 flex gap-2">

              {[1, 2, 3, 4, 5].map(
                (star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setRating(star)
                    }
                    className={`text-4xl ${
                      star <= rating
                        ? 'text-yellow-500'
                        : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ),
              )}

            </div>

            <p className="mt-2 text-sm text-gray-500">
              {rating}/5
            </p>

          </div>

          <div className="mt-7">

            <label className="block text-sm font-semibold text-gray-700">
              Tell us about your stay
            </label>

            <textarea
              value={comment}
              onChange={(event) =>
                setComment(
                  event.target.value,
                )
              }
              rows={6}
              placeholder="How was the hotel, room, service and overall experience?"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="mt-7 w-full rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:bg-gray-400"
          >
            {saving
              ? 'Saving...'
              : existingReview
                ? 'Update Review'
                : 'Submit Review'}
          </button>

        </div>

      </main>

    </div>
  )
}

export default WriteReviewPage