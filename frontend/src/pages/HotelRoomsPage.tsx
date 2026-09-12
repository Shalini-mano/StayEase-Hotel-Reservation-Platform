import { useEffect, useState } from 'react'
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'

import api from '../api/axios'

interface Room {
  id: string
  hotelId: string
  roomNumber: string
  roomType: string
  description: string
  pricePerNight: number
  capacity: number
  amenities: string[]
  images: string[]
  available: boolean
}

interface Review {
  id: string
  hotelId: string
  userId: string
  bookingId: string
  rating: number
  comment: string
  createdAt: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface LocationState {
  checkIn?: string
  checkOut?: string
  guests?: number
  hotelName?: string
  rooms?: Room[]
}

function HotelRoomsPage() {
  const { hotelId } = useParams()

  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const state =
    (location.state || {}) as LocationState

  const selectedRoomId =
    searchParams.get('roomId')

  const queryCheckIn =
    searchParams.get('checkIn') || ''

  const queryCheckOut =
    searchParams.get('checkOut') || ''

  const queryGuests =
    searchParams.get('guests') || ''

  const checkIn =
    state.checkIn || queryCheckIn

  const checkOut =
    state.checkOut || queryCheckOut

  const guests =
    state.guests ||
    (queryGuests
      ? Number(queryGuests)
      : undefined)

  const hotelName =
    state.hotelName

  const [rooms, setRooms] =
    useState<Room[]>(
      state.rooms || [],
    )

  const [reviews, setReviews] =
    useState<Review[]>([])

  const [loading, setLoading] =
    useState(false)

  const [reviewsLoading, setReviewsLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  /*
   * LOAD ROOMS
   */
  useEffect(() => {
    if (
      state.rooms &&
      state.rooms.length > 0
    ) {
      return
    }

    const fetchRooms = async () => {
      try {
        setLoading(true)
        setError('')

        const response =
          await api.get<
            ApiResponse<Room[]>
          >(
            `/api/rooms/hotel/${hotelId}`,
          )

        setRooms(
          response.data.data || [],
        )
      } catch (err) {
        console.error(
          'Failed to load rooms:',
          err,
        )

        setError(
          'Failed to load rooms.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [hotelId, state.rooms])

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
          'Failed to load hotel reviews:',
          err,
        )
      } finally {
        setReviewsLoading(false)
      }
    }

    fetchReviews()
  }, [hotelId])

  /*
   * CONTINUE TO BOOKING CONFIRMATION
   */
  const handleBookRoom = (
    room: Room,
  ) => {
    if (
      !checkIn ||
      !checkOut ||
      !guests
    ) {
      setError(
        'Booking dates or guest information are missing. Please search again.',
      )

      return
    }

    setError('')

    navigate(
      '/booking/confirm',
      {
        state: {
          room,
          hotelName,
          checkIn,
          checkOut,
          guests,
        },
      },
    )
  }

  /*
   * AVERAGE REVIEW RATING
   */
  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (
            total,
            review,
          ) =>
            total +
            review.rating,
          0,
        ) /
        reviews.length
      : 0

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="mx-auto max-w-7xl">

        {/* BACK BUTTON */}

        <button
          onClick={() => {
            if (
              checkIn &&
              checkOut &&
              guests
            ) {
              const params =
                new URLSearchParams()

              params.set(
                'checkIn',
                checkIn,
              )

              params.set(
                'checkOut',
                checkOut,
              )

              params.set(
                'guests',
                String(guests),
              )

              navigate(
                `/hotels/search?${params.toString()}`,
              )
            } else {
              navigate(
                '/hotels/search',
              )
            }
          }}
          className="mb-4 rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300"
        >
          ← Back to Search
        </button>

        {/* HOTEL HEADER */}

        <div className="mb-6 rounded-xl bg-white p-6 shadow">

          <h1 className="text-3xl font-bold text-gray-900">
            {hotelName ||
              'Available Rooms'}
          </h1>

          {reviews.length > 0 ? (
            <div className="mt-2 flex items-center gap-2">

              <span className="text-xl text-yellow-500">
                ★
              </span>

              <span className="font-semibold">
                {averageRating.toFixed(
                  1,
                )}
              </span>

              <span className="text-gray-500">
                (
                {reviews.length}{' '}
                {reviews.length === 1
                  ? 'review'
                  : 'reviews'}
                )
              </span>

            </div>
          ) : (
            !reviewsLoading && (
              <p className="mt-2 text-gray-500">
                No reviews yet
              </p>
            )
          )}

          {checkIn &&
            checkOut && (
              <p className="mt-3 text-gray-600">

                {checkIn}
                {' → '}
                {checkOut}

                {guests &&
                  ` • ${guests} guest${
                    guests > 1
                      ? 's'
                      : ''
                  }`}

              </p>
            )}

          {selectedRoomId && (
            <p className="mt-3 text-sm font-medium text-blue-600">
              Your selected room has been highlighted below.
            </p>
          )}

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* ROOMS TITLE */}

        <h2 className="mb-5 text-2xl font-bold text-gray-900">
          Available Rooms
        </h2>

        {loading && (
          <p className="text-gray-600">
            Loading rooms...
          </p>
        )}

        {!loading &&
          rooms.length === 0 && (
            <div className="rounded-xl bg-white p-8 text-center shadow">

              <h3 className="text-lg font-semibold text-gray-800">
                No rooms available
              </h3>

              <p className="mt-2 text-gray-500">
                Try another date or guest count.
              </p>

            </div>
          )}

        {/* ROOM CARDS */}

        <div className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">

          {rooms.map(
            (room) => {
              const isSelected =
                selectedRoomId ===
                room.id

              return (
                <div
                  key={room.id}
                  className={`flex h-full flex-col overflow-hidden rounded-xl bg-white shadow transition ${
                    isSelected
                      ? 'ring-2 ring-blue-600'
                      : ''
                  }`}
                >

                  {/* IMAGE */}

                  <div className="relative h-56 w-full overflow-hidden bg-gray-200">

                    <img
                      src={
                        room.images?.[0] ||
                        '/room-placeholder.png'
                      }
                      alt={
                        room.roomType
                      }
                      className="h-full w-full object-cover"
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

                    {isSelected && (
                      <span className="absolute left-4 top-4 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow">
                        Selected Room
                      </span>
                    )}

                    {!room.available && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">

                        <span className="rounded-lg bg-white px-4 py-2 font-semibold text-gray-800">
                          Unavailable
                        </span>

                      </div>
                    )}

                  </div>

                  {/* CONTENT */}

                  <div className="flex flex-1 flex-col p-5">

                    {/* TITLE */}

                    <div>

                      <h3 className="text-xl font-bold text-gray-900">
                        Room{' '}
                        {room.roomNumber}
                      </h3>

                      <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-blue-600">
                        {room.roomType}
                      </p>

                    </div>

                    {/* DESCRIPTION */}

                    {room.description && (
                      <p className="mt-4 leading-6 text-gray-600">
                        {room.description}
                      </p>
                    )}

                    {/* CAPACITY / PRICE */}

                    <div className="mt-5 grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">

                      <div>

                        <p className="text-xs uppercase text-gray-400">
                          Capacity
                        </p>

                        <p className="mt-1 font-semibold text-gray-800">
                          {room.capacity}{' '}
                          guest
                          {room.capacity > 1
                            ? 's'
                            : ''}
                        </p>

                      </div>

                      <div>

                        <p className="text-xs uppercase text-gray-400">
                          Price
                        </p>

                        <p className="mt-1 font-bold text-gray-900">
                          €
                          {Number(
                            room.pricePerNight,
                          ).toFixed(2)}
                        </p>

                        <p className="text-xs text-gray-500">
                          per night
                        </p>

                      </div>

                    </div>

                    {/* AMENITIES */}

                    {room.amenities &&
                      room.amenities.length >
                        0 && (
                        <div className="mt-5">

                          <p className="text-sm font-semibold text-gray-800">
                            Amenities
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2">

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
                                  {amenity}
                                </span>
                              ),
                            )}

                          </div>

                        </div>
                      )}

                    {/* BUTTON */}

                    <div className="mt-auto pt-6">

                      <button
                        onClick={() =>
                          handleBookRoom(
                            room,
                          )
                        }
                        disabled={
                          !room.available
                        }
                        className={`w-full rounded-lg px-4 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-gray-400 ${
                          isSelected
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >

                        {!room.available
                          ? 'Unavailable'
                          : isSelected
                            ? 'Continue Booking'
                            : 'Book Room'}

                      </button>

                    </div>

                  </div>

                </div>
              )
            },
          )}

        </div>

        {/* REVIEWS */}

        <div className="mt-12">

          <h2 className="mb-5 text-2xl font-bold text-gray-900">
            Guest Reviews
          </h2>

          {reviewsLoading && (
            <p className="text-gray-600">
              Loading reviews...
            </p>
          )}

          {!reviewsLoading &&
            reviews.length ===
              0 && (
              <div className="rounded-xl bg-white p-6 shadow">

                <p className="text-gray-600">
                  No reviews have been submitted for this hotel yet.
                </p>

              </div>
            )}

          <div className="grid gap-5 md:grid-cols-2">

            {reviews.map(
              (review) => (
                <div
                  key={
                    review.id
                  }
                  className="rounded-xl bg-white p-5 shadow"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-1">

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

                    <span className="text-sm text-gray-500">

                      {review.createdAt
                        ? new Date(
                            review.createdAt,
                          ).toLocaleDateString()
                        : ''}

                    </span>

                  </div>

                  <p className="mt-4 text-gray-700">
                    {review.comment}
                  </p>

                  <p className="mt-4 text-sm font-medium text-gray-500">
                    Verified StayEase guest
                  </p>

                </div>
              ),
            )}

          </div>

        </div>

      </div>

    </div>
  )
}

export default HotelRoomsPage