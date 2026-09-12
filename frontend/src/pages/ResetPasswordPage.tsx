import {
  useState,
  type FormEvent,
} from 'react'
import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import api from '../api/axios'

interface ResetPasswordState {
  token?: string
  expiresAt?: string
  email?: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function ResetPasswordPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const state =
    location.state as
      | ResetPasswordState
      | null

  /*
   * Keep reset token internally.
   * Do not display it in the UI.
   */
  const [token] = useState(
    state?.token || '',
  )

  const [newPassword, setNewPassword] =
    useState('')

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('')

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    /*
     * Token should have been passed
     * from ForgotPasswordPage.
     */
    if (!token.trim()) {
      setError(
        'Password reset session is missing or invalid. Please request a new reset token.',
      )
      return
    }

    /*
     * Backend requires minimum 8 characters.
     */
    if (
      newPassword.length < 8
    ) {
      setError(
        'Password must contain at least 8 characters.',
      )
      return
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setError(
        'New password and confirm password do not match.',
      )
      return
    }

    try {
      setLoading(true)

      const response =
        await api.post<
          ApiResponse<null>
        >(
          '/api/auth/reset-password',
          {
            token,
            newPassword,
          },
        )

      setSuccess(
        response.data.message ||
          'Password reset successfully.',
      )

      /*
       * Redirect user to login
       * after successful reset.
       */
      setTimeout(() => {
        navigate(
          '/login',
          {
            replace: true,
          },
        )
      }, 1500)
    } catch (err: any) {
      console.error(
        'Reset password failed:',
        err,
      )

      setError(
        err.response?.data?.message ||
          'Failed to reset password.',
      )
    } finally {
      setLoading(false)
    }
  }

  /*
   * If someone manually opens
   * /reset-password without first
   * requesting a reset token.
   */
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">

        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">

          <h1 className="text-3xl font-bold text-blue-600">
            StayEase
          </h1>

          <h2 className="mt-5 text-2xl font-bold text-gray-900">
            Reset Link Invalid
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Your password reset session is missing or has expired.
            Please request a new password reset.
          </p>

          <Link
            to="/forgot-password"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Forgot Password
          </Link>

          <div className="mt-5">

            <Link
              to="/login"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Back to Sign In
            </Link>

          </div>

        </div>

      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">

      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">

        {/* LOGO */}

        <h1 className="text-center text-3xl font-bold text-blue-600">
          StayEase
        </h1>

        <h2 className="mt-5 text-center text-2xl font-bold text-gray-900">
          Reset Password
        </h2>

        <p className="mt-2 text-center text-sm text-gray-500">
          Choose a new password for your account.
        </p>

        {/* ACCOUNT */}

        {state?.email && (
          <p className="mt-4 text-center text-sm text-gray-600">
            Account:{' '}
            <span className="font-medium">
              {state.email}
            </span>
          </p>
        )}

        {/* EXPIRY */}

        {state?.expiresAt && (
          <p className="mt-1 text-center text-xs text-gray-400">
            Reset token expires at{' '}
            {new Date(
              state.expiresAt,
            ).toLocaleString()}
          </p>
        )}

        {/* ERROR */}

        {error && (
          <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >

          {/* NEW PASSWORD */}

          <div>

            <label
              htmlFor="newPassword"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              New Password
            </label>

            <input
              id="newPassword"
              type="password"
              value={
                newPassword
              }
              onChange={(event) =>
                setNewPassword(
                  event.target.value,
                )
              }
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Enter new password"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <p className="mt-1 text-xs text-gray-400">
              Minimum 8 characters
            </p>

          </div>

          {/* CONFIRM PASSWORD */}

          <div>

            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Confirm New Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={
                confirmPassword
              }
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value,
                )
              }
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Confirm new password"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? 'Resetting Password...'
              : 'Reset Password'}
          </button>

        </form>

        {/* BACK */}

        <p className="mt-6 text-center text-sm text-gray-500">

          <Link
            to="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Back to Sign In
          </Link>

        </p>

      </div>

    </div>
  )
}

export default ResetPasswordPage