import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Link,
  useSearchParams,
} from 'react-router-dom'

import api from '../api/axios'

interface Room {
  id: string
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

type SortOption =
  | 'recommended'
  | 'price-low'
  | 'price-high'
  | 'rating-high'

function PublicHotelSearchPage() {
  const [searchParams] = useSearchParams()

  const city =
    searchParams.get('city') || ''

  const checkIn =
    searchParams.get('checkIn') || ''

  const checkOut =
    searchParams.get('checkOut') || ''

  const guests =
    searchParams.get('guests') || '1'

  const [results, setResults] =
    useState<HotelSearchResult[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [maxPrice, setMaxPrice] =
    useState('')

  const [minRating, setMinRating] =
    useState('0')

  const [amenity, setAmenity] =
    useState('')

  const [sortBy, setSortBy] =
    useState<SortOption>('recommended')

  const [currentPage, setCurrentPage] =
    useState(1)

  const hotelsPerPage = 5

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true)
        setError('')

        const response =
          await api.get<
            ApiResponse<HotelSearchResult[]>
          >(
            '/api/hotels/search',
            {
              params: {
                city,
                checkIn,
                checkOut,
                guests,
              },
            },
          )

        setResults(
          response.data.data || [],
        )
      } catch (err: any) {
        console.error(
          'Public hotel search failed:',
          err,
        )

        setError(
          err.response?.data?.message ||
            'Failed to search hotels',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchHotels()
  }, [
    city,
    checkIn,
    checkOut,
    guests,
  ])

  useEffect(() => {
    setCurrentPage(1)
  }, [
    maxPrice,
    minRating,
    amenity,
    sortBy,
    city,
    checkIn,
    checkOut,
    guests,
  ])

  const availableAmenities =
    useMemo(() => {
      const items =
        new Set<string>()

      results.forEach(
        (result) => {
          result.hotel.amenities?.forEach(
            (item) =>
              items.add(item),
          )
        },
      )

      return Array.from(
        items,
      ).sort()
    }, [results])

  const filteredResults =
    useMemo(() => {
      let filtered = [
        ...results,
      ]

      if (
        maxPrice.trim()
      ) {
        const price =
          Number(maxPrice)

        if (
          !Number.isNaN(price)
        ) {
          filtered =
            filtered.filter(
              (result) =>
                Number(
                  result.lowestPrice,
                ) <= price,
            )
        }
      }

      const rating =
        Number(minRating)

      if (rating > 0) {
        filtered =
          filtered.filter(
            (result) =>
              Number(
                result.hotel.rating ||
                  0,
              ) >= rating,
          )
      }

      if (amenity) {
        filtered =
          filtered.filter(
            (result) =>
              result.hotel.amenities?.some(
                (item) =>
                  item.toLowerCase() ===
                  amenity.toLowerCase(),
              ),
          )
      }

      if (
        sortBy === 'price-low'
      ) {
        filtered.sort(
          (a, b) =>
            Number(
              a.lowestPrice,
            ) -
            Number(
              b.lowestPrice,
            ),
        )
      }

      if (
        sortBy === 'price-high'
      ) {
        filtered.sort(
          (a, b) =>
            Number(
              b.lowestPrice,
            ) -
            Number(
              a.lowestPrice,
            ),
        )
      }

      if (
        sortBy === 'rating-high'
      ) {
        filtered.sort(
          (a, b) =>
            Number(
              b.hotel.rating ||
                0,
            ) -
            Number(
              a.hotel.rating ||
                0,
            ),
        )
      }

      return filtered
    }, [
      results,
      maxPrice,
      minRating,
      amenity,
      sortBy,
    ])

  const totalPages =
    Math.ceil(
      filteredResults.length /
        hotelsPerPage,
    )

  const startIndex =
    (currentPage - 1) *
    hotelsPerPage

  const paginatedResults =
    filteredResults.slice(
      startIndex,
      startIndex +
        hotelsPerPage,
    )

  const clearFilters = () => {
    setMaxPrice('')
    setMinRating('0')
    setAmenity('')
    setSortBy(
      'recommended',
    )
    setCurrentPage(1)
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
              className="rounded-lg bg-white px-4 py-2 font-medium text-blue-700 hover:bg-gray-100"
            >
              Register
            </Link>

            <Link
              to="/login"
              className="rounded-lg border border-white px-4 py-2 font-medium text-white hover:bg-blue-800"
            >
              Sign in
            </Link>

          </div>

        </div>

      </header>

      {/* MAIN */}

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* SEARCH INFO */}

        <div className="mb-7">

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

            <div>

              <h1 className="text-3xl font-bold text-gray-900">
                Hotels in{' '}
                {city ||
                  'your destination'}
              </h1>

              <p className="mt-2 text-gray-500">

                {checkIn &&
                checkOut
                  ? `${checkIn} → ${checkOut}`
                  : 'Choose your stay dates'}

                {' · '}

                {guests}{' '}
                guest
                {guests !== '1'
                  ? 's'
                  : ''}

              </p>

            </div>

            <Link
              to="/"
              className="w-fit rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Search Again
            </Link>

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* FILTERS */}

        {!loading &&
          results.length > 0 && (
            <div className="mb-7 rounded-xl bg-white p-5 shadow">

              <div className="flex flex-col gap-5 xl:flex-row xl:items-end">

                <div className="flex-1">

                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Maximum price / night
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(event) =>
                      setMaxPrice(
                        event.target.value,
                      )
                    }
                    placeholder="Any price"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                </div>

                <div className="flex-1">

                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Minimum rating
                  </label>

                  <select
                    value={minRating}
                    onChange={(event) =>
                      setMinRating(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="0">
                      Any rating
                    </option>

                    <option value="3">
                      3.0+
                    </option>

                    <option value="4">
                      4.0+
                    </option>

                    <option value="4.5">
                      4.5+
                    </option>

                    <option value="5">
                      5.0
                    </option>
                  </select>

                </div>

                <div className="flex-1">

                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Amenity
                  </label>

                  <select
                    value={amenity}
                    onChange={(event) =>
                      setAmenity(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">
                      All amenities
                    </option>

                    {availableAmenities.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      ),
                    )}

                  </select>

                </div>

                <div className="flex-1">

                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Sort by
                  </label>

                  <select
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(
                        event.target
                          .value as
                          SortOption,
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="recommended">
                      Recommended
                    </option>

                    <option value="price-low">
                      Price: Low to High
                    </option>

                    <option value="price-high">
                      Price: High to Low
                    </option>

                    <option value="rating-high">
                      Rating: High to Low
                    </option>
                  </select>

                </div>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-lg bg-gray-200 px-5 py-3 font-medium text-gray-700 hover:bg-gray-300"
                >
                  Clear
                </button>

              </div>

            </div>
          )}

        {/* RESULT COUNT */}

        {!loading &&
          results.length > 0 &&
          filteredResults.length > 0 && (
            <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">

              <p className="text-sm text-gray-500">
                Showing{' '}
                {startIndex + 1}
                {' - '}
                {Math.min(
                  startIndex +
                    hotelsPerPage,
                  filteredResults.length,
                )}
                {' of '}
                {filteredResults.length}
                {' matching hotel'}
                {filteredResults.length !==
                1
                  ? 's'
                  : ''}
              </p>

              {results.length !==
                filteredResults.length && (
                <p className="text-xs text-gray-400">
                  {results.length}{' '}
                  total hotel
                  {results.length !==
                  1
                    ? 's'
                    : ''}{' '}
                  found
                </p>
              )}

            </div>
          )}

        {/* CONTENT */}

        {loading ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">

            <p className="text-gray-500">
              Searching hotels...
            </p>

          </div>
        ) : results.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">

            <h2 className="text-xl font-bold text-gray-800">
              No hotels found
            </h2>

            <p className="mt-2 text-gray-500">
              Try another destination or different dates.
            </p>

            <Link
              to="/"
              className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
            >
              Search Again
            </Link>

          </div>
        ) : filteredResults.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">

            <h2 className="text-xl font-bold text-gray-800">
              No hotels match your filters
            </h2>

            <p className="mt-2 text-gray-500">
              Try changing the price, rating or amenity filters.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
            >
              Clear Filters
            </button>

          </div>
        ) : (
          <>
            <div className="space-y-6">

              {paginatedResults.map(
                (result) => {
                  const hotel =
                    result.hotel

                  return (
                    <div
                      key={hotel.id}
                      className="overflow-hidden rounded-xl bg-white shadow md:flex"
                    >

                      <div className="md:w-72">

                        <img
                          src={
                            hotel.images?.[0] ||
                            '/hotel-placeholder.png'
                          }
                          alt={hotel.name}
                          className="h-56 w-full object-cover md:h-full"
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

                      </div>

                      <div className="flex flex-1 flex-col justify-between p-6 md:flex-row">

                        <div className="max-w-2xl">

                          <h2 className="text-2xl font-bold text-blue-700">
                            {hotel.name}
                          </h2>

                          <p className="mt-1 text-sm text-gray-500">
                            {hotel.city},{' '}
                            {hotel.country}
                          </p>

                          {hotel.description && (
                            <p className="mt-4 text-sm leading-6 text-gray-600">
                              {
                                hotel.description
                              }
                            </p>
                          )}

                          {hotel.amenities &&
                            hotel.amenities.length >
                              0 && (
                              <div className="mt-4 flex flex-wrap gap-2">

                                {hotel.amenities
                                  .slice(0, 5)
                                  .map(
                                    (item) => (
                                      <span
                                        key={item}
                                        className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
                                      >
                                        {item}
                                      </span>
                                    ),
                                  )}

                              </div>
                            )}

                        </div>

                        <div className="mt-6 flex min-w-48 flex-col items-end justify-between md:ml-8 md:mt-0">

                          <div className="text-right">

                            <p className="text-sm text-gray-500">
                              Rating
                            </p>

                            <div className="mt-1 inline-block rounded-lg bg-blue-700 px-3 py-2 text-lg font-bold text-white">
                              {Number(
                                hotel.rating ||
                                  0,
                              ).toFixed(1)}
                            </div>

                          </div>

                          <div className="mt-6 text-right">

                            <p className="text-sm text-gray-500">
                              {
                                result.availableRoomCount
                              }{' '}
                              room
                              {result.availableRoomCount !==
                              1
                                ? 's'
                                : ''}{' '}
                              available
                            </p>

                            <p className="mt-1 text-2xl font-bold text-gray-900">
                              €
                              {Number(
                                result.lowestPrice ||
                                  0,
                              ).toFixed(2)}
                            </p>

                            <p className="text-xs text-gray-500">
                              lowest price / night
                            </p>

                            <Link
                              to={`/public/hotels/${hotel.id}/rooms?checkIn=${encodeURIComponent(
                                checkIn,
                              )}&checkOut=${encodeURIComponent(
                                checkOut,
                              )}&guests=${encodeURIComponent(
                                guests,
                              )}`}
                              state={{
                                hotel,
                                availableRooms:
                                  result.availableRooms,
                              }}
                              className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                            >
                              View Rooms
                            </Link>

                          </div>

                        </div>

                      </div>

                    </div>
                  )
                },
              )}

            </div>

            {/* PAGINATION */}

            {totalPages > 1 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">

                <button
                  type="button"
                  disabled={
                    currentPage === 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          page - 1,
                          1,
                        ),
                    )
                  }
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Previous
                </button>

                {Array.from(
                  {
                    length:
                      totalPages,
                  },
                  (_, index) =>
                    index + 1,
                ).map(
                  (page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() =>
                        setCurrentPage(
                          page,
                        )
                      }
                      className={`rounded-lg px-4 py-2 font-medium ${
                        currentPage ===
                        page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          page + 1,
                          totalPages,
                        ),
                    )
                  }
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next →
                </button>

              </div>
            )}

          </>
        )}

      </main>

    </div>
  )
}

export default PublicHotelSearchPage