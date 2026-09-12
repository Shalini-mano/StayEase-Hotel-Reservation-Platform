import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  available: boolean
}

interface Hotel {
  id: string
  name: string
  description?: string
  address?: string
  city: string
  country?: string
  postalCode?: string
  rating: number
  amenities?: string[]
  images?: string[]
  active: boolean
}

interface HotelSearchResult {
  hotel: Hotel
  availableRooms: Room[]
  availableRoomCount: number
  lowestPrice: number
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface SearchForm {
  city: string
  checkIn: string
  checkOut: string
  guests: number
  minPrice: string
  maxPrice: string
  minRating: string
  amenity: string
}

function HotelSearchPage() {
  const [formData, setFormData] = useState<SearchForm>({
    city: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    minPrice: '',
    maxPrice: '',
    minRating: '',
    amenity: '',
  })

  const [results, setResults] = useState<HotelSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]:
        name === 'guests'
          ? Number(value)
          : value,
    }))
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    setLoading(true)
    setError('')
    setSearched(true)
    setResults([])

    try {
      const response = await api.get<
        ApiResponse<HotelSearchResult[]>
      >('/api/hotels/search', {
        params: {
          city: formData.city,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          guests: formData.guests,

          minPrice: formData.minPrice
            ? Number(formData.minPrice)
            : undefined,

          maxPrice: formData.maxPrice
            ? Number(formData.maxPrice)
            : undefined,

          minRating: formData.minRating
            ? Number(formData.minRating)
            : undefined,

          amenity: formData.amenity || undefined,
        },
      })

      setResults(response.data.data || [])
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to search hotels',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              StayEase
            </h1>

            <p className="text-sm text-gray-500">
              Find your perfect stay
            </p>
          </div>

          <div className="flex gap-3">

            <Link
              to="/customer/dashboard"
              className="bg-gray-100 text-gray-700 px-4 py-2
                         rounded-lg font-medium hover:bg-gray-200"
            >
              Dashboard
            </Link>

            <Link
              to="/profile"
              className="bg-blue-600 text-white px-4 py-2
                         rounded-lg font-medium hover:bg-blue-700"
            >
              Profile
            </Link>

          </div>

        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        <div className="mb-8">

          <h2 className="text-3xl font-bold text-gray-800">
            Search Hotels
          </h2>

          <p className="text-gray-500 mt-2">
            Search by destination, dates and number of guests.
          </p>

        </div>

        {/* SEARCH FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow p-6 mb-8"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination
              </label>

              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Amsterdam"
                required
                className="w-full border border-gray-300 rounded-lg
                           px-4 py-3 focus:outline-none
                           focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-in
              </label>

              <input
                type="date"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg
                           px-4 py-3 focus:outline-none
                           focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-out
              </label>

              <input
                type="date"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg
                           px-4 py-3 focus:outline-none
                           focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guests
              </label>

              <input
                type="number"
                name="guests"
                min="1"
                value={formData.guests}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg
                           px-4 py-3 focus:outline-none
                           focus:ring-2 focus:ring-blue-500"
              />
            </div>

          </div>

          {/* FILTERS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Price
              </label>

              <input
                type="number"
                name="minPrice"
                min="0"
                value={formData.minPrice}
                onChange={handleChange}
                placeholder="50"
                className="w-full border border-gray-300 rounded-lg
                           px-4 py-3 focus:outline-none
                           focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Price
              </label>

              <input
                type="number"
                name="maxPrice"
                min="0"
                value={formData.maxPrice}
                onChange={handleChange}
                placeholder="300"
                className="w-full border border-gray-300 rounded-lg
                           px-4 py-3 focus:outline-none
                           focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Rating
              </label>

              <input
                type="number"
                name="minRating"
                min="0"
                max="5"
                step="0.1"
                value={formData.minRating}
                onChange={handleChange}
                placeholder="4"
                className="w-full border border-gray-300 rounded-lg
                           px-4 py-3 focus:outline-none
                           focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amenity
              </label>

              <input
                type="text"
                name="amenity"
                value={formData.amenity}
                onChange={handleChange}
                placeholder="WiFi"
                className="w-full border border-gray-300 rounded-lg
                           px-4 py-3 focus:outline-none
                           focus:ring-2 focus:ring-blue-500"
              />
            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 bg-blue-600 text-white px-8 py-3
                       rounded-lg font-semibold hover:bg-blue-700
                       disabled:opacity-50"
          >
            {loading
              ? 'Searching...'
              : 'Search Hotels'}
          </button>

        </form>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* RESULTS */}
        {searched && !loading && !error && (
          <div>

            <h3 className="text-xl font-semibold text-gray-800 mb-5">
              {results.length} hotel
              {results.length !== 1 ? 's' : ''} found
            </h3>

            {results.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-8 text-center">

                <p className="text-gray-500">
                  No hotels found for your search.
                </p>

              </div>
            ) : (
              <div className="space-y-6">

                {results.map((result) => (
                  <HotelCard
                    key={result.hotel.id}
                    result={result}
                    checkIn={formData.checkIn}
                    checkOut={formData.checkOut}
                    guests={formData.guests}
                  />
                ))}

              </div>
            )}

          </div>
        )}

      </main>

    </div>
  )
}

interface HotelCardProps {
  result: HotelSearchResult
  checkIn: string
  checkOut: string
  guests: number
}

function HotelCard({
  result,
  checkIn,
  checkOut,
  guests,
}: HotelCardProps) {
  const navigate = useNavigate()
  const { hotel } = result

  const handleViewRooms = () => {
    navigate(`/hotels/${hotel.id}/rooms`, {
      state: {
        checkIn,
        checkOut,
        guests,
        hotelName: hotel.name,
      },
    })
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">

      <div className="p-6">

        <div className="flex flex-col md:flex-row md:justify-between gap-6">

          <div className="flex-1">

            <h3 className="text-2xl font-bold text-gray-800">
              {hotel.name}
            </h3>

            <p className="text-gray-500 mt-1">
              {hotel.city}
              {hotel.country
                ? `, ${hotel.country}`
                : ''}
            </p>

            {hotel.description && (
              <p className="text-gray-600 mt-4">
                {hotel.description}
              </p>
            )}

            {hotel.address && (
              <p className="text-sm text-gray-500 mt-3">
                {hotel.address}
              </p>
            )}

            {hotel.amenities &&
              hotel.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">

                  {hotel.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="bg-gray-100 text-gray-700
                                 px-3 py-1 rounded-full text-sm"
                    >
                      {amenity}
                    </span>
                  ))}

                </div>
              )}

          </div>

          <div className="md:text-right min-w-40">

            <div
              className="inline-block bg-blue-600 text-white
                         px-3 py-1 rounded-lg font-bold"
            >
              {typeof hotel.rating === 'number'
                ? hotel.rating.toFixed(1)
                : '0.0'}
            </div>

            <p className="text-sm text-gray-500 mt-4">
              From
            </p>

            <p className="text-2xl font-bold text-gray-800">
              €
              {typeof result.lowestPrice === 'number'
                ? result.lowestPrice.toFixed(2)
                : '0.00'}
            </p>

            <p className="text-sm text-gray-500">
              per night
            </p>

          </div>

        </div>

        <div
          className="border-t border-gray-200 mt-6 pt-5
                     flex flex-col sm:flex-row
                     justify-between items-start
                     sm:items-center gap-4"
        >

          <p className="text-gray-600">
            <span className="font-semibold">
              {result.availableRoomCount}
            </span>{' '}
            room
            {result.availableRoomCount !== 1
              ? 's'
              : ''}{' '}
            available
          </p>

          <button
            type="button"
            onClick={handleViewRooms}
            disabled={result.availableRoomCount === 0}
            className="bg-blue-600 text-white px-6 py-2
                       rounded-lg font-medium hover:bg-blue-700
                       disabled:bg-gray-300
                       disabled:cursor-not-allowed"
          >
            View Rooms
          </button>

        </div>

      </div>

    </div>
  )
}

export default HotelSearchPage