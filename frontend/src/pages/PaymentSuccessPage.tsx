import {
  Link,
  useLocation,
} from 'react-router-dom'

interface PaymentSuccessState {
  bookingId: string
  totalPrice: number
}

function PaymentSuccessPage() {
  const location = useLocation()

  const state =
    location.state as
      | PaymentSuccessState
      | null

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">

      <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
          ✓
        </div>

        <h1 className="mt-5 text-3xl font-bold text-gray-900">
          Payment Successful
        </h1>

        <p className="mt-3 text-gray-600">
          Your booking has been confirmed successfully.
        </p>

        {state ? (
          <>
            <div className="mt-6 rounded-xl bg-gray-50 p-5">

              <p className="text-sm text-gray-500">
                Amount Paid
              </p>

              <p className="mt-2 text-3xl font-bold text-green-700">
                €{state.totalPrice.toFixed(2)}
              </p>

              <div className="mt-5 rounded-lg bg-green-100 px-4 py-3">

                <p className="font-semibold text-green-800">
                  Booking Confirmed
                </p>

                <p className="mt-1 text-sm text-green-700">
                  Your room reservation is confirmed.
                </p>

              </div>

            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">

              <Link
                to={`/bookings/${state.bookingId}`}
                className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                View Booking
              </Link>

              <Link
                to="/bookings"
                className="rounded-lg bg-gray-200 px-5 py-3 font-semibold text-gray-800 hover:bg-gray-300"
              >
                My Bookings
              </Link>

            </div>
          </>
        ) : (
          <div className="mt-7">

            <p className="mb-5 text-sm text-gray-500">
              Your payment has been completed.
            </p>

            <Link
              to="/bookings"
              className="inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              My Bookings
            </Link>

          </div>
        )}

      </div>

    </div>
  )
}

export default PaymentSuccessPage