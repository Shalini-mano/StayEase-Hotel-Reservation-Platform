import { useMemo, useState } from 'react'
import {
  useLocation,
  useNavigate,
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
}

interface BookingState {
  room: Room
  hotelName?: string
  checkIn: string
  checkOut: string
  guests: number
}

function BookingConfirmationPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const state =
    location.state as BookingState | null

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  const numberOfNights = useMemo(() => {
    if (
      !state?.checkIn ||
      !state?.checkOut
    ) {
      return 0
    }

    const start =
      new Date(state.checkIn)

    const end =
      new Date(state.checkOut)

    const diff =
      end.getTime() -
      start.getTime()

    return Math.max(
      0,
      Math.ceil(
        diff /
          (1000 * 60 * 60 * 24),
      ),
    )
  }, [
    state?.checkIn,
    state?.checkOut,
  ])

  const totalPrice =
    state
      ? numberOfNights *
        state.room.pricePerNight
      : 0

  if (!state) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-3xl rounded-lg bg-white p-8 shadow">

          <h1 className="text-2xl font-bold">
            Booking information missing
          </h1>

          <p className="mt-3 text-gray-600">
            Please search for a hotel and select
            a room again.
          </p>

          <button
            onClick={() =>
              navigate('/hotels/search')
            }
            className="mt-6 rounded bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Search Hotels
          </button>

        </div>
      </div>
    )
  }

  const handleConfirmBooking =
    async () => {
      try {
        setLoading(true)
        setError('')

        const response =
          await api.post(
            '/api/bookings',
            {
              roomId:
                state.room.id,

              checkIn:
                state.checkIn,

              checkOut:
                state.checkOut,

              guests:
                state.guests,
            },
          )

        const booking =
          response.data.data

        navigate(
          `/bookings/${booking.id}`,
        )
      } catch (err: any) {
        console.error(
          'Booking failed:',
          err,
        )

        setError(
          err.response?.data
            ?.message ||
            'Booking failed. Please try again.',
        )
      } finally {
        setLoading(false)
      }
    }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="mx-auto max-w-4xl">

        <button
          onClick={() =>
            navigate(-1)
          }
          className="mb-4 rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
        >
          ← Back
        </button>

        <h1 className="mb-6 text-3xl font-bold">
          Confirm your booking
        </h1>

        {error && (
          <div className="mb-6 rounded bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">

          <div className="space-y-6 md:col-span-2">

            {/* HOTEL */}

            <div className="rounded-lg bg-white p-6 shadow">

              <p className="text-sm text-gray-500">
                Hotel
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                {state.hotelName ||
                  'StayEase Hotel'}
              </h2>

            </div>


            {/* ROOM */}

            <div className="rounded-lg bg-white p-6 shadow">

              <h2 className="text-xl font-bold">
                Room details
              </h2>

              <div className="mt-4 space-y-2 text-gray-700">

                <p>
                  <strong>
                    Room:
                  </strong>{' '}
                  {
                    state.room
                      .roomNumber
                  }
                </p>

                <p>
                  <strong>
                    Type:
                  </strong>{' '}
                  {
                    state.room
                      .roomType
                  }
                </p>

                <p>
                  <strong>
                    Capacity:
                  </strong>{' '}
                  {
                    state.room
                      .capacity
                  }{' '}
                  guests
                </p>

                <p>
                  <strong>
                    Price:
                  </strong>{' '}
                  €
                  {state.room.pricePerNight.toFixed(
                    2,
                  )}{' '}
                  / night
                </p>

              </div>

            </div>


            {/* STAY */}

            <div className="rounded-lg bg-white p-6 shadow">

              <h2 className="text-xl font-bold">
                Stay details
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">

                <div>
                  <p className="text-sm text-gray-500">
                    Check-in
                  </p>

                  <p className="font-semibold">
                    {state.checkIn}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Check-out
                  </p>

                  <p className="font-semibold">
                    {state.checkOut}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Guests
                  </p>

                  <p className="font-semibold">
                    {state.guests}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Nights
                  </p>

                  <p className="font-semibold">
                    {numberOfNights}
                  </p>
                </div>

              </div>

            </div>

          </div>


          {/* PRICE SUMMARY */}

          <div>

            <div className="sticky top-6 rounded-lg bg-white p-6 shadow">

              <h2 className="text-xl font-bold">
                Price summary
              </h2>

              <div className="mt-5 space-y-3">

                <div className="flex justify-between">
                  <span>
                    €
                    {state.room.pricePerNight.toFixed(
                      2,
                    )}{' '}
                    × {numberOfNights}
                  </span>

                  <span>
                    €
                    {totalPrice.toFixed(
                      2,
                    )}
                  </span>
                </div>

                <hr />

                <div className="flex justify-between text-lg font-bold">

                  <span>
                    Total
                  </span>

                  <span>
                    €
                    {totalPrice.toFixed(
                      2,
                    )}
                  </span>

                </div>

              </div>

              <button
                onClick={
                  handleConfirmBooking
                }
                disabled={loading}
                className="mt-6 w-full rounded bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading
                  ? 'Confirming...'
                  : 'Confirm Booking'}
              </button>

              <p className="mt-3 text-center text-xs text-gray-500">
                Payment will be completed
                after the booking is created.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

export default BookingConfirmationPage