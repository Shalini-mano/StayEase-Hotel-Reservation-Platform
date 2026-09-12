import { useState, type FormEvent } from 'react'
import api from '../api/axios'
import type { ChangePasswordRequest } from '../features/auth/accountTypes'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function ChangePasswordForm() {
  const [formData, setFormData] = useState<ChangePasswordRequest>({
    currentPassword: '',
    newPassword: '',
  })

  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (formData.newPassword !== confirmPassword) {
      setError('New password and confirm password do not match')
      return
    }

    if (formData.newPassword.length < 6) {
      setError('New password must contain at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const response = await api.patch<ApiResponse<unknown>>(
        '/api/users/password',
        formData,
      )

      setSuccess(
        response.data.message || 'Password changed successfully',
      )

      setFormData({
        currentPassword: '',
        newPassword: '',
      })

      setConfirmPassword('')
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to change password',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-8 mt-6">

      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Change Password
      </h3>

      <p className="text-sm text-gray-500 mb-6">
        Enter your current password and choose a new password.
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-5">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-5">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Password
          </label>

          <input
            name="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg
                       px-4 py-3 focus:outline-none
                       focus:ring-2 focus:ring-blue-500"
            placeholder="Enter current password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>

          <input
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg
                       px-4 py-3 focus:outline-none
                       focus:ring-2 focus:ring-blue-500"
            placeholder="Enter new password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
            required
            className="w-full border border-gray-300 rounded-lg
                       px-4 py-3 focus:outline-none
                       focus:ring-2 focus:ring-blue-500"
            placeholder="Confirm new password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg
                     font-semibold hover:bg-blue-700
                     disabled:opacity-50"
        >
          {loading ? 'Changing Password...' : 'Change Password'}
        </button>

      </form>

    </div>
  )
}

export default ChangePasswordForm