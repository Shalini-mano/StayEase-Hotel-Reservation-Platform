import { Link, useNavigate } from 'react-router-dom'
import { useState, type FormEvent } from 'react'

function HomePage() {
  const navigate = useNavigate()

  const [destination, setDestination] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('2')

  const handleSearch = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    const params = new URLSearchParams()

    if (destination.trim()) {
      params.set(
        'city',
        destination.trim(),
      )
    }

    if (checkIn) {
      params.set('checkIn', checkIn)
    }

    if (checkOut) {
      params.set('checkOut', checkOut)
    }

    if (guests) {
      params.set('guests', guests)
    }

    /*
     * For now we send the user to login.
     *
     * In the next step we will make hotel
     * search public and connect these
     * search parameters directly to it.
     */
    navigate(
      `/search?${params.toString()}`,
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}

      <header className="bg-blue-700 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link
            to="/"
            className="text-3xl font-bold"
          >
            StayEase
          </Link>

          <div className="flex items-center gap-3">

            <Link
              to="/register"
              className="rounded-lg bg-white px-5 py-2 font-semibold text-blue-700 hover:bg-gray-100"
            >
              Register
            </Link>

            <Link
              to="/login"
              className="rounded-lg border border-white px-5 py-2 font-semibold text-white hover:bg-blue-600"
            >
              Sign in
            </Link>

          </div>
        </div>
      </header>


      {/* HERO */}

      <section className="bg-blue-700 pb-28 text-white">

        <div className="mx-auto max-w-7xl px-6 pt-12">

          <h1 className="max-w-3xl text-4xl font-bold md:text-5xl">
            Find your perfect stay
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            Search hotels, compare rooms and book
            your next stay with StayEase.
          </p>

        </div>

      </section>


      {/* SEARCH BOX */}

      <section className="mx-auto -mt-16 max-w-7xl px-6">

        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 gap-3 rounded-xl bg-yellow-400 p-3 shadow-xl md:grid-cols-5"
        >

          {/* DESTINATION */}

          <div className="md:col-span-1">
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              Destination
            </label>

            <input
              type="text"
              value={destination}
              required
              onChange={(event) =>
                setDestination(
                  event.target.value,
                )
              }
              placeholder="Amsterdam"
              className="w-full rounded-lg bg-white px-4 py-3 text-gray-800 outline-none"
            />
          </div>


          {/* CHECK IN */}

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              Check-in
            </label>

            <input
              type="date"
              value={checkIn}
              required
              onChange={(event) =>
                setCheckIn(
                  event.target.value,
                )
              }
              className="w-full rounded-lg bg-white px-4 py-3 text-gray-800 outline-none"
            />
          </div>


          {/* CHECK OUT */}

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              Check-out
            </label>

            <input
              type="date"
              value={checkOut}
              required
              onChange={(event) =>
                setCheckOut(
                  event.target.value,
                )
              }
              className="w-full rounded-lg bg-white px-4 py-3 text-gray-800 outline-none"
            />
          </div>


          {/* GUESTS */}

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              Guests
            </label>

            <select
              value={guests}
              onChange={(event) =>
                setGuests(
                  event.target.value,
                )
              }
              className="w-full rounded-lg bg-white px-4 py-3 text-gray-800 outline-none"
            >
              <option value="1">
                1 Guest
              </option>

              <option value="2">
                2 Guests
              </option>

              <option value="3">
                3 Guests
              </option>

              <option value="4">
                4 Guests
              </option>

              <option value="5">
                5 Guests
              </option>

              <option value="6">
                6 Guests
              </option>
            </select>
          </div>


          {/* SEARCH */}

          <div className="flex items-end">

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
            >
              Search
            </button>

          </div>

        </form>

      </section>


      {/* POPULAR DESTINATIONS */}

      <section className="mx-auto max-w-7xl px-6 py-14">

        <div className="mb-7">

          <h2 className="text-3xl font-bold text-gray-900">
            Popular destinations
          </h2>

          <p className="mt-2 text-gray-500">
            Explore popular places for your next
            StayEase booking.
          </p>

        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

          <DestinationCard
            city="Amsterdam"
            country="Netherlands"
            description="Canals, museums and historic streets."
          />

          <DestinationCard
            city="Rotterdam"
            country="Netherlands"
            description="Modern architecture and vibrant city life."
          />

          <DestinationCard
            city="Eindhoven"
            country="Netherlands"
            description="Technology, design and contemporary culture."
          />

        </div>

      </section>


      {/* WHY STAYEASE */}

      <section className="bg-white py-14">

        <div className="mx-auto max-w-7xl px-6">

          <h2 className="mb-8 text-3xl font-bold text-gray-900">
            Why book with StayEase?
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

            <FeatureCard
              title="Easy hotel search"
              description="Search by destination, dates, guests, price and amenities."
            />

            <FeatureCard
              title="Secure bookings"
              description="Manage your bookings and payments from your account."
            />

            <FeatureCard
              title="Verified reviews"
              description="Guests can review hotels after completing their stay."
            />

          </div>

        </div>

      </section>


      {/* MANAGER SECTION */}

      <section className="mx-auto max-w-7xl px-6 py-14">

        <div className="rounded-2xl bg-blue-700 p-8 text-white md:p-12">

          <div className="max-w-2xl">

            <h2 className="text-3xl font-bold">
              Manage your hotel with StayEase
            </h2>

            <p className="mt-3 text-blue-100">
              Create hotels, manage rooms and
              monitor bookings from one dashboard.
            </p>

            <Link
              to="/login"
              className="mt-6 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-blue-700 hover:bg-gray-100"
            >
              Manager Login
            </Link>

          </div>

        </div>

      </section>


      {/* FOOTER */}

      <footer className="bg-gray-900 text-gray-300">

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-6 py-8 md:flex-row md:items-center">

          <div>

            <h3 className="text-xl font-bold text-white">
              StayEase
            </h3>

            <p className="mt-1 text-sm">
              Hotel Reservation Platform
            </p>

          </div>

          <div className="flex gap-5 text-sm">

            <Link
              to="/login"
              className="hover:text-white"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="hover:text-white"
            >
              Register
            </Link>

          </div>

        </div>

      </footer>

    </div>
  )
}

interface DestinationCardProps {
  city: string
  country: string
  description: string
}

function DestinationCard({
  city,
  country,
  description,
}: DestinationCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg">

      <div className="mb-4 flex h-44 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-300">

        <span className="text-4xl font-bold text-blue-700">
          {city}
        </span>

      </div>

      <h3 className="text-xl font-bold text-gray-900">
        {city}
      </h3>

      <p className="text-sm text-gray-500">
        {country}
      </p>

      <p className="mt-3 text-sm text-gray-600">
        {description}
      </p>

    </div>
  )
}

interface FeatureCardProps {
  title: string
  description: string
}

function FeatureCard({
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 p-6">

      <h3 className="text-lg font-bold text-gray-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-gray-600">
        {description}
      </p>

    </div>
  )
}

export default HomePage