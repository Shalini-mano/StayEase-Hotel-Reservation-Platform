import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import ChangePasswordForm from '../components/ChangePasswordForm'

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: string
  profileImage?: string
  enabled: boolean
}

interface UpdateProfileRequest {
  firstName: string
  lastName: string
  phone: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)

  const [formData, setFormData] = useState<UpdateProfileRequest>({
    firstName: '',
    lastName: '',
    phone: '',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get<ApiResponse<UserProfile>>(
          '/api/users/profile',
        )

        const user = response.data.data

        setProfile(user)

        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.phone || '',
        })
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            'Failed to load profile',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleEdit = () => {
    setEditing(true)
    setSuccess('')
    setError('')
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
      })
    }

    setEditing(false)
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await api.put<ApiResponse<UserProfile>>(
        '/api/users/profile',
        formData,
      )

      const updatedProfile = response.data.data

      setProfile(updatedProfile)

      setFormData({
        firstName: updatedProfile.firstName || '',
        lastName: updatedProfile.lastName || '',
        phone: updatedProfile.phone || '',
      })

      setEditing(false)

      setSuccess(
        response.data.message ||
          'Profile updated successfully',
      )
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to update profile',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600 text-lg">
          Loading profile...
        </p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white shadow rounded-xl p-6 text-center">

          <p className="text-red-600 mb-4">
            {error || 'Profile not found'}
          </p>

          <Link
            to="/customer/dashboard"
            className="text-blue-600 font-medium hover:underline"
          >
            Back to Dashboard
          </Link>

        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <header className="bg-white shadow-sm">

        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">

          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              StayEase
            </h1>

            <p className="text-sm text-gray-500">
              My Profile
            </p>
          </div>

          <Link
            to="/customer/dashboard"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg
                       font-medium hover:bg-blue-700"
          >
            Dashboard
          </Link>

        </div>

      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">

        <div className="bg-white rounded-xl shadow p-8">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-8">

            <div className="flex items-center gap-5">

              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">

                <span className="text-3xl font-bold text-blue-600">
                  {profile.firstName
                    ?.charAt(0)
                    .toUpperCase()}
                </span>

              </div>

              <div>

                <h2 className="text-2xl font-bold text-gray-800">
                  {profile.firstName} {profile.lastName}
                </h2>

                <p className="text-gray-500">
                  {profile.email}
                </p>

                <span
                  className="inline-block mt-2 bg-blue-100 text-blue-700
                             text-sm font-medium px-3 py-1 rounded-full"
                >
                  {profile.role}
                </span>

              </div>

            </div>

            {!editing && (
              <button
                onClick={handleEdit}
                className="bg-gray-800 text-white px-5 py-2 rounded-lg
                           font-medium hover:bg-gray-900"
              >
                Edit Profile
              </button>
            )}

          </div>

          {success && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {!editing ? (
            <div className="border-t border-gray-200 pt-6">

              <h3 className="text-lg font-semibold text-gray-800 mb-5">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <ProfileField
                  label="First Name"
                  value={profile.firstName}
                />

                <ProfileField
                  label="Last Name"
                  value={profile.lastName}
                />

                <ProfileField
                  label="Email"
                  value={profile.email}
                />

                <ProfileField
                  label="Phone"
                  value={profile.phone || 'Not provided'}
                />

                <ProfileField
                  label="Role"
                  value={profile.role}
                />

                <ProfileField
                  label="Account Status"
                  value={
                    profile.enabled
                      ? 'Active'
                      : 'Disabled'
                  }
                />

              </div>

            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="border-t border-gray-200 pt-6"
            >

              <h3 className="text-lg font-semibold text-gray-800 mb-5">
                Edit Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>

                  <input
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg
                               px-4 py-3 focus:outline-none
                               focus:ring-2 focus:ring-blue-500"
                  />

                </div>

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>

                  <input
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg
                               px-4 py-3 focus:outline-none
                               focus:ring-2 focus:ring-blue-500"
                  />

                </div>

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>

                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+31612345678"
                    className="w-full border border-gray-300 rounded-lg
                               px-4 py-3 focus:outline-none
                               focus:ring-2 focus:ring-blue-500"
                  />

                </div>

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>

                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full border border-gray-200 rounded-lg
                               px-4 py-3 bg-gray-100 text-gray-500
                               cursor-not-allowed"
                  />

                  <p className="text-xs text-gray-400 mt-1">
                    Email cannot be changed here.
                  </p>

                </div>

              </div>

              <div className="flex gap-3 mt-7">

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg
                             font-semibold hover:bg-blue-700
                             disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : 'Save Changes'}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg
                             font-semibold hover:bg-gray-300"
                >
                  Cancel
                </button>

              </div>

            </form>
          )}

        </div>

        {/* CHANGE PASSWORD */}
        <ChangePasswordForm />

      </main>

    </div>
  )
}

interface ProfileFieldProps {
  label: string
  value: string
}

function ProfileField({
  label,
  value,
}: ProfileFieldProps) {
  return (
    <div>

      <p className="text-sm text-gray-500 mb-1">
        {label}
      </p>

      <p className="font-medium text-gray-800">
        {value}
      </p>

    </div>
  )
}

export default ProfilePage