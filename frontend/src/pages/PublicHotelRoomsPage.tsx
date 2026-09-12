import { useEffect, useState } from 'react'
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from 'react-router-dom'

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
}

interface Review {
  id: string
  hotelId: string
  userId: string
  bookingId: string
  rating: number
  comment: string
  createdAt: string
  updatedAt?: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface LocationState {
  hotel?: Hotel
  availableRooms?: Room[]
}

function PublicHotelRoomsPage() {
  const { hotelId } = useParams()

  const location = useLocation()
  const state = location.state as LocationState | null

  const [searchParams] = useSearchParams()

  const checkIn = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''
  const guests = searchParams.get('guests') || '1'

  const [hotel, setHotel] =
    useState<Hotel | null>(
      state?.hotel || null,
    )

  const [rooms, setRooms] =
    useState<Room[]>(
      state?.availableRooms || [],
    )

  const [reviews, setReviews] =
    useState<Review[]>([])

  const [loading, setLoading] =
    useState(true)

  const [reviewsLoading, setReviewsLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  /*
   * LOAD HOTEL + ROOMS
   */
  useEffect(() => {
    const loadData = async () => {
      if (!hotelId) {
        setError('Hotel ID is missing')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        if (!hotel) {
          const hotelResponse =
            await api.get<
              ApiResponse<Hotel>
            >(
              `/api/hotels/${hotelId}`,
            )

          setHotel(
            hotelResponse.data.data,
          )
        }

        if (rooms.length === 0) {
          const roomResponse =
            await api.get<
              ApiResponse<Room[]>
            >(
              `/api/rooms/hotel/${hotelId}/available`,
            )

          setRooms(
            roomResponse.data.data || [],
          )
        }
      } catch (err: any) {
        console.error(
          'Failed to load hotel rooms:',
          err,
        )

        setError(
          err.response?.data?.message ||
            'Failed to load hotel rooms',
        )
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [hotelId])

  /*
   * LOAD REVIEWS
   */
  useEffect(() => {
    const fetchReviews = async () => {
      if (!hotelId) {
        return
      }

      try {
        setReviewsLoading(true)

        const response =
          await api.get<
            ApiResponse<Review[]>
          >(
            `/api/reviews/hotel/${hotelId}`,
          )

        setReviews(
          response.data.data || [],
        )
      } catch (err) {
        console.error(
          'Failed to load reviews:',
          err,
        )
      } finally {
        setReviewsLoading(false)
      }
    }

    fetchReviews()
  }, [hotelId])

  /*
   * CREATE LOGIN REDIRECT
   */
  const createLoginUrl = (
    roomId: string,
  ) => {
    if (!hotel) {
      return '/login'
    }

    const redirect =
      `/hotels/${hotel.id}/rooms` +
      `?checkIn=${encodeURIComponent(checkIn)}` +
      `&checkOut=${encodeURIComponent(checkOut)}` +
      `&guests=${encodeURIComponent(guests)}` +
      `&roomId=${encodeURIComponent(roomId)}`

    return `/login?redirect=${encodeURIComponent(
      redirect,
    )}`
  }

  /*
   * AVERAGE REVIEW RATING
   */
  const averageReviewRating =
    reviews.length > 0
      ? reviews.reduce(
          (
            total,
            review,
          ) =>
            total +
            review.rating,
          0,
        ) / reviews.length
      : 0

  /*
   * LOADING
   */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-500">
          Loading hotel...
        </p>
      </div>
    )
  }

  /*
   * ERROR
   */
  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-gray-100">

        <header className="bg-blue-700 text-white">

          <div className="mx-auto max-w-7xl px-6 py-5">

            <Link
              to="/"
              className="text-2xl font-bold"
            >
              StayEase
            </Link>

          </div>

        </header>

        <main className="mx-auto max-w-4xl px-6 py-16 text-center">

          <h1 className="text-2xl font-bold text-gray-900">
            Unable to load hotel
          </h1>

          <p className="mt-3 text-red-600">
            {error || 'Hotel not found'}
          </p>

          <Link
            to="/"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Back to Home
          </Link>

        </main>

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}

      <header className="bg-blue-700 text-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link
            to="/"
            className="text-2xl font-bold"
          >
            StayEase
          </Link>

          <div className="flex gap-3">

            <Link
              to="/register"
              className="rounded-lg bg-white px-4 py-2 font-semibold text-blue-700 hover:bg-gray-100"
            >
              Register
            </Link>

            <Link
              to="/login"
              className="rounded-lg border border-white px-4 py-2 font-semibold text-white hover:bg-blue-800"
            >
              Sign in
            </Link>

          </div>

        </div>

      </header>

      {/* MAIN */}

      <main className="mx-auto max-w-7xl px-6 py-8">

        <Link
          to="/"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back to search
        </Link>

        {/* HOTEL DETAILS */}

        <div className="mt-5 overflow-hidden rounded-xl bg-white shadow">

          <img
            src={
              hotel.images?.[0] ||
              '/hotel-placeholder.png'
            }
            alt={hotel.name}
            className="h-80 w-full object-cover"
            onError={(event) => {
              const image =
                event.currentTarget

              if (
                !image.src.includes(
                  'hotel-placeholder.png',
                )
              ) {
                image.src =
                  '/hotel-placeholder.png'
              }
            }}
          />

          <div className="p-7">

            <div className="flex flex-col justify-between gap-4 md:flex-row">

              <div>

                <h1 className="text-3xl font-bold text-gray-900">
                  {hotel.name}
                </h1>

                <p className="mt-2 text-gray-500">
                  {hotel.address},{' '}
                  {hotel.city},{' '}
                  {hotel.country}
                </p>

              </div>

              <div className="text-left md:text-right">

                <p className="text-sm text-gray-500">
                  Guest rating
                </p>

                <div className="mt-1 inline-block rounded-lg bg-blue-700 px-3 py-2 text-xl font-bold text-white">
                  {Number(
                    hotel.rating || 0,
                  ).toFixed(1)}
                </div>

              </div>

            </div>

            {hotel.description && (
              <p className="mt-6 max-w-4xl leading-7 text-gray-600">
                {hotel.description}
              </p>
            )}

            {hotel.amenities &&
              hotel.amenities.length >
                0 && (
                <div className="mt-6">

                  <h2 className="font-bold text-gray-900">
                    Hotel amenities
                  </h2>

                  <div className="mt-3 flex flex-wrap gap-2">

                    {hotel.amenities.map(
                      (amenity) => (
                        <span
                          key={amenity}
                          className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
                        >
                          {amenity}
                        </span>
                      ),
                    )}

                  </div>

                </div>
              )}

            {hotel.policies && (
              <div className="mt-6">

                <h2 className="font-bold text-gray-900">
                  Hotel policies
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {hotel.policies}
                </p>

              </div>
            )}

          </div>

        </div>

        {/* STAY INFORMATION */}

        <div className="mt-8 rounded-xl bg-white p-6 shadow">

          <h2 className="text-xl font-bold text-gray-900">
            Your stay
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">

            <div>

              <p className="text-xs font-semibold uppercase text-gray-400">
                Check-in
              </p>

              <p className="mt-1 font-medium text-gray-800">
                {checkIn ||
                  'Not selected'}
              </p>

            </div>

            <div>

              <p className="text-xs font-semibold uppercase text-gray-400">
                Check-out
              </p>

              <p className="mt-1 font-medium text-gray-800">
                {checkOut ||
                  'Not selected'}
              </p>

            </div>

            <div>

              <p className="text-xs font-semibold uppercase text-gray-400">
                Guests
              </p>

              <p className="mt-1 font-medium text-gray-800">
                {guests}{' '}
                guest
                {guests !== '1'
                  ? 's'
                  : ''}
              </p>

            </div>

          </div>

        </div>

        {/* AVAILABLE ROOMS */}

        <section className="mt-10">

          <div className="mb-6">

            <h2 className="text-3xl font-bold text-gray-900">
              Available rooms
            </h2>

            <p className="mt-2 text-gray-500">
              Choose the room that best suits your stay.
            </p>

          </div>

          {rooms.length === 0 ? (
            <div className="rounded-xl bg-white p-10 text-center shadow">

              <h3 className="text-xl font-bold text-gray-800">
                No rooms available
              </h3>

              <p className="mt-2 text-gray-500">
                Try different travel dates or guest count.
              </p>

              <Link
                to="/"
                className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Search Again
              </Link>

            </div>
          ) : (
            <div className="space-y-5">

              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="overflow-hidden rounded-xl bg-white shadow md:flex"
                >

                  {/* ROOM IMAGE */}

                  <div className="md:w-72">

                    <img
                      src={
                        room.images?.[0] ||
                        '/room-placeholder.png'
                      }
                      alt={
                        room.roomType
                      }
                      className="h-56 w-full object-cover md:h-full"
                      onError={(event) => {
                        const image =
                          event.currentTarget

                        if (
                          !image.src.includes(
                            'room-placeholder.png',
                          )
                        ) {
                          image.src =
                            '/room-placeholder.png'
                        }
                      }}
                    />

                  </div>

                  {/* ROOM DETAILS */}

                  <div className="flex flex-1 flex-col justify-between gap-6 p-6 md:flex-row">

                    <div>

                      <h3 className="text-xl font-bold text-gray-900">
                        {
                          room.roomType
                        }
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Room{' '}
                        {
                          room.roomNumber
                        }
                      </p>

                      <p className="mt-2 text-sm text-gray-600">
                        Up to{' '}
                        {
                          room.capacity
                        }{' '}
                        guest
                        {room.capacity !==
                        1
                          ? 's'
                          : ''}
                      </p>

                      {room.description && (
                        <p className="mt-4 max-w-xl text-sm leading-6 text-gray-600">
                          {
                            room.description
                          }
                        </p>
                      )}

                      {room.amenities &&
                        room.amenities
                          .length >
                          0 && (
                          <div className="mt-4 flex flex-wrap gap-2">

                            {room.amenities.map(
                              (
                                amenity,
                              ) => (
                                <span
                                  key={
                                    amenity
                                  }
                                  className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
                                >
                                  {
                                    amenity
                                  }
                                </span>
                              ),
                            )}

                          </div>
                        )}

                    </div>

                    {/* PRICE + BOOK */}

                    <div className="min-w-44 text-left md:text-right">

                      <p className="text-sm text-gray-500">
                        Price per night
                      </p>

                      <p className="mt-1 text-2xl font-bold text-gray-900">
                        €
                        {Number(
                          room.pricePerNight,
                        ).toFixed(2)}
                      </p>

                      <Link
                        to={createLoginUrl(
                          room.id,
                        )}
                        className="mt-5 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                      >
                        Book Now
                      </Link>

                      <p className="mt-2 text-xs text-gray-400">
                        Sign in required to book
                      </p>

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </section>

        {/* GUEST REVIEWS */}

        <section className="mt-12">

          <div className="mb-6">

            <h2 className="text-3xl font-bold text-gray-900">
              Guest reviews
            </h2>

            {reviews.length > 0 && (
              <div className="mt-2 flex items-center gap-2">

                <span className="text-2xl text-yellow-500">
                  ★
                </span>

                <span className="text-lg font-bold text-gray-900">
                  {averageReviewRating.toFixed(
                    1,
                  )}
                </span>

                <span className="text-sm text-gray-500">
                  based on{' '}
                  {reviews.length}{' '}
                  {reviews.length ===
                  1
                    ? 'review'
                    : 'reviews'}
                </span>

              </div>
            )}

          </div>

          {reviewsLoading ? (
            <div className="rounded-xl bg-white p-6 shadow">

              <p className="text-gray-500">
                Loading reviews...
              </p>

            </div>
          ) : reviews.length ===
            0 ? (
            <div className="rounded-xl bg-white p-8 text-center shadow">

              <h3 className="text-lg font-semibold text-gray-800">
                No reviews yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Be the first guest to review this hotel after completing a stay.
              </p>

            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">

              {reviews.map(
                (review) => (
                  <div
                    key={
                      review.id
                    }
                    className="rounded-xl bg-white p-6 shadow"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex gap-1">

                        {[
                          1,
                          2,
                          3,
                          4,
                          5,
                        ].map(
                          (
                            star,
                          ) => (
                            <span
                              key={
                                star
                              }
                              className={
                                star <=
                                review.rating
                                  ? 'text-xl text-yellow-500'
                                  : 'text-xl text-gray-300'
                              }
                            >
                              ★
                            </span>
                          ),
                        )}

                      </div>

                      <span className="text-xs text-gray-400">
                        {review.createdAt
                          ? new Date(
                              review.createdAt,
                            ).toLocaleDateString()
                          : ''}
                      </span>

                    </div>

                    <p className="mt-4 leading-6 text-gray-700">
                      {
                        review.comment
                      }
                    </p>

                    <p className="mt-4 text-sm font-medium text-gray-500">
                      Verified StayEase guest
                    </p>

                  </div>
                ),
              )}

            </div>
          )}

        </section>

      </main>

    </div>
  )
}

export default PublicHotelRoomsPage