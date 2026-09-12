import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'

import api from '../api/axios'

interface Hotel {
  id: string
  name: string
  description: string
  address: string
  city: string
  country: string
  postalCode: string
  latitude?: number
  longitude?: number
  amenities?: string[]
  images?: string[]
  policies?: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function EditHotelPage() {
  const { hotelId } = useParams()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [description, setDescription] =
    useState('')
  const [address, setAddress] =
    useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] =
    useState('')
  const [postalCode, setPostalCode] =
    useState('')
  const [latitude, setLatitude] =
    useState('')
  const [longitude, setLongitude] =
    useState('')
  const [amenities, setAmenities] =
    useState('')
  const [policies, setPolicies] =
    useState('')

  // IMAGE STATES
  const [images, setImages] =
    useState<string[]>([])

  const [newImageUrl, setNewImageUrl] =
    useState('')

  const [imageError, setImageError] =
    useState('')

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState('')

  const parseList = (value: string) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        setError('')

        const response =
          await api.get<
            ApiResponse<Hotel>
          >(
            `/api/hotels/${hotelId}`,
          )

        const hotel =
          response.data.data

        setName(hotel.name || '')
        setDescription(
          hotel.description || '',
        )
        setAddress(
          hotel.address || '',
        )
        setCity(hotel.city || '')
        setCountry(
          hotel.country || '',
        )
        setPostalCode(
          hotel.postalCode || '',
        )

        setLatitude(
          hotel.latitude !==
            undefined
            ? String(
                hotel.latitude,
              )
            : '',
        )

        setLongitude(
          hotel.longitude !==
            undefined
            ? String(
                hotel.longitude,
              )
            : '',
        )

        setAmenities(
          hotel.amenities?.join(
            ', ',
          ) || '',
        )

        setImages(
          hotel.images || [],
        )

        setPolicies(
          hotel.policies || '',
        )
      } catch (err: any) {
        console.error(
          'Failed to load hotel:',
          err,
        )

        setError(
          err.response?.data
            ?.message ||
            'Failed to load hotel',
        )
      } finally {
        setLoading(false)
      }
    }

    if (hotelId) {
      fetchHotel()
    }
  }, [hotelId])

  /*
   * ADD IMAGE
   */
  const handleAddImage = () => {
    const url =
      newImageUrl.trim()

    if (!url) {
      setImageError(
        'Please enter an image URL.',
      )
      return
    }

    if (
      !url.startsWith(
        'http://',
      ) &&
      !url.startsWith(
        'https://',
      )
    ) {
      setImageError(
        'Please enter a valid http or https image URL.',
      )
      return
    }

    if (images.includes(url)) {
      setImageError(
        'This image has already been added.',
      )
      return
    }

    setImages((current) => [
      ...current,
      url,
    ])

    setNewImageUrl('')
    setImageError('')
  }

  /*
   * REMOVE IMAGE
   */
  const handleRemoveImage = (
    index: number,
  ) => {
    setImages((current) =>
      current.filter(
        (_, imageIndex) =>
          imageIndex !== index,
      ),
    )
  }

  /*
   * SUBMIT
   */
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')

      const payload = {
        name,
        description,
        address,
        city,
        country,
        postalCode,

        latitude:
          latitude.trim()
            ? Number(latitude)
            : null,

        longitude:
          longitude.trim()
            ? Number(longitude)
            : null,

        amenities:
          parseList(amenities),

        // IMPORTANT
        images,

        policies,
      }

      console.log(
        'Updating hotel:',
        payload,
      )

      await api.put(
        `/api/hotels/${hotelId}`,
        payload,
      )

      navigate(
        '/manager/hotels',
      )
    } catch (err: any) {
      console.error(
        'Failed to update hotel:',
        err,
      )

      setError(
        err.response?.data
          ?.message ||
          'Failed to update hotel',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">
          Loading hotel...
        </p>
      </div>
    )
  }

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
              Edit Hotel
            </p>
          </div>

          <Link
            to="/manager/hotels"
            className="rounded-lg bg-gray-600 px-5 py-2 font-medium text-white hover:bg-gray-700"
          >
            Back to Hotels
          </Link>

        </div>

      </header>

      {/* MAIN */}

      <main className="mx-auto max-w-5xl px-6 py-8">

        <div className="rounded-xl bg-white p-8 shadow">

          <h2 className="mb-6 text-2xl font-bold text-gray-800">
            Update Hotel Information
          </h2>

          {error && (
            <div className="mb-6 rounded-lg bg-red-100 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-6"
          >

            {/* BASIC INFORMATION */}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              <InputField
                label="Hotel Name"
                value={name}
                onChange={
                  setName
                }
                required
              />

              <InputField
                label="City"
                value={city}
                onChange={
                  setCity
                }
                required
              />

              <InputField
                label="Country"
                value={country}
                onChange={
                  setCountry
                }
                required
              />

              <InputField
                label="Postal Code"
                value={
                  postalCode
                }
                onChange={
                  setPostalCode
                }
              />

              <InputField
                label="Address"
                value={
                  address
                }
                onChange={
                  setAddress
                }
                required
              />

              <InputField
                label="Latitude"
                value={
                  latitude
                }
                onChange={
                  setLatitude
                }
                type="number"
              />

              <InputField
                label="Longitude"
                value={
                  longitude
                }
                onChange={
                  setLongitude
                }
                type="number"
              />

            </div>

            {/* DESCRIPTION */}

            <div>

              <label className="mb-1 block text-sm font-medium text-gray-700">
                Description
              </label>

              <textarea
                value={
                  description
                }
                onChange={(
                  event,
                ) =>
                  setDescription(
                    event.target
                      .value,
                  )
                }
                rows={4}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* AMENITIES */}

            <InputField
              label="Amenities"
              value={amenities}
              onChange={
                setAmenities
              }
              placeholder="WiFi, Parking, Breakfast, Pool"
            />

            {/* HOTEL IMAGES */}

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">

              <div className="mb-4">

                <h3 className="text-lg font-semibold text-gray-800">
                  Hotel Images
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Add image URLs for this hotel. The first image will be used as the main hotel image.
                </p>

              </div>

              <div className="flex flex-col gap-3 sm:flex-row">

                <input
                  type="url"
                  value={
                    newImageUrl
                  }
                  placeholder="https://example.com/hotel.jpg"
                  onChange={(
                    event,
                  ) => {
                    setNewImageUrl(
                      event.target
                        .value,
                    )

                    setImageError(
                      '',
                    )
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="button"
                  onClick={
                    handleAddImage
                  }
                  className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
                >
                  Add Image
                </button>

              </div>

              {imageError && (
                <p className="mt-2 text-sm text-red-600">
                  {imageError}
                </p>
              )}

              {/* IMAGE PREVIEWS */}

              {images.length >
              0 ? (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">

                  {images.map(
                    (
                      image,
                      index,
                    ) => (
                      <div
                        key={`${image}-${index}`}
                        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                      >

                        <div className="relative">

                          <img
                            src={
                              image
                            }
                            alt={`Hotel ${index + 1}`}
                            className="h-40 w-full object-cover"
                            onError={(
                              event,
                            ) => {
                              event.currentTarget.style.display =
                                'none'
                            }}
                          />

                          {index ===
                            0 && (
                            <span className="absolute left-2 top-2 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                              Main Image
                            </span>
                          )}

                        </div>

                        <div className="p-3">

                          <p className="truncate text-xs text-gray-500">
                            {image}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveImage(
                                index,
                              )
                            }
                            className="mt-3 w-full rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
                          >
                            Remove
                          </button>

                        </div>

                      </div>
                    ),
                  )}

                </div>
              ) : (
                <div className="mt-5 rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center">

                  <p className="text-sm text-gray-500">
                    No hotel images added yet.
                  </p>

                </div>
              )}

            </div>

            {/* POLICIES */}

            <div>

              <label className="mb-1 block text-sm font-medium text-gray-700">
                Policies
              </label>

              <textarea
                value={policies}
                onChange={(
                  event,
                ) =>
                  setPolicies(
                    event.target
                      .value,
                  )
                }
                rows={3}
                placeholder="Check-in from 14:00. No smoking. Free cancellation up to 24 hours before arrival."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* SAVE */}

            <div className="flex items-center gap-3 border-t border-gray-200 pt-6">

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? 'Saving...'
                  : 'Update Hotel'}
              </button>

              <Link
                to="/manager/hotels"
                className="rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </Link>

            </div>

          </form>

        </div>

      </main>

    </div>
  )
}

interface InputFieldProps {
  label: string
  value: string
  onChange: (
    value: string,
  ) => void
  type?: string
  required?: boolean
  placeholder?: string
}

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder,
}: InputFieldProps) {
  return (
    <div>

      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        placeholder={
          placeholder
        }
        step={
          type === 'number'
            ? 'any'
            : undefined
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

    </div>
  )
}

export default EditHotelPage