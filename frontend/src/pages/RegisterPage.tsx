import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import type {
  ApiResponse,
  AuthResponse,
  RegisterRequest,
} from '../features/auth/types'

function RegisterPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState<RegisterRequest>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'CUSTOMER',
  })

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

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await api.post<
        ApiResponse<AuthResponse>
      >('/api/auth/register', formData)

      setSuccess(
        response.data.message || 'Account created successfully',
      )

      setTimeout(() => {
        navigate('/login')
      }, 1200)
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Registration failed',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-center text-blue-600">
          StayEase
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-8">
          Create your customer account
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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
                className="w-full border border-gray-300 rounded-lg px-4 py-3
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="First name"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-3
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Last name"
              />
            </div>

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>

            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
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
              className="w-full border border-gray-300 rounded-lg px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+31612345678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>

            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Create a password"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg
                       font-semibold hover:bg-blue-700
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>

      </div>

    </div>
  )
}

export default RegisterPage