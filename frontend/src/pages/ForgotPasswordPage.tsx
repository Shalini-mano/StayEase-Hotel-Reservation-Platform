import { useState, type FormEvent } from 'react'
import {
  Link,
  useNavigate,
} from 'react-router-dom'

import api from '../api/axios'

interface ForgotPasswordResponse {
  resetToken: string
  expiresAt: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function ForgotPasswordPage() {
  const navigate = useNavigate()

  const [email, setEmail] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    try {
      setLoading(true)
      setError('')

      const response =
        await api.post<
          ApiResponse<ForgotPasswordResponse>
        >(
          '/api/auth/forgot-password',
          {
            email,
          },
        )

      const resetData =
        response.data.data

      navigate(
        '/reset-password',
        {
          state: {
            token:
              resetData.resetToken,
            expiresAt:
              resetData.expiresAt,
            email,
          },
        },
      )
    } catch (err: any) {
      console.error(
        'Forgot password failed:',
        err,
      )

      setError(
        err.response?.data?.message ||
          'Unable to generate password reset token.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">

      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">

        <h1 className="text-center text-3xl font-bold text-blue-600">
          StayEase
        </h1>

        <h2 className="mt-5 text-center text-2xl font-bold text-gray-900">
          Forgot Password
        </h2>

        <p className="mt-2 text-center text-sm text-gray-500">
          Enter the email address associated with your account.
        </p>

        {error && (
          <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >

          <div>

            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              required
              placeholder="Enter your email"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? 'Generating Reset Token...'
              : 'Continue'}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-gray-500">

          Remember your password?{' '}

          <Link
            to="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Sign in
          </Link>

        </p>

      </div>

    </div>
  )
}

export default ForgotPasswordPage