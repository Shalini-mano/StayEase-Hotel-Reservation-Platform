import { useState, type FormEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'

import type { AppDispatch, RootState } from '../app/store'
import { login } from '../features/auth/authSlice'

function LoginPage() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const { loading, error } = useSelector(
    (state: RootState) => state.auth,
  )

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

const handleSubmit = async (
  event: FormEvent<HTMLFormElement>,
) => {
  event.preventDefault()

  try {
   const result = await dispatch(
     login({ email, password }),
   ).unwrap()

   const role = result.user.role

   const params = new URLSearchParams(
     window.location.search,
   )

   const redirect = params.get('redirect')

   if (
     role === 'CUSTOMER' &&
     redirect
   ) {
     navigate(redirect)
     return
   }

   if (role === 'CUSTOMER') {
     navigate('/customer/dashboard')
     return
   }

   if (role === 'HOTEL_MANAGER') {
     navigate('/manager/dashboard')
     return
   }

   if (role === 'ADMIN') {
     navigate('/admin/dashboard')
     return
   }
  } catch (error) {
    console.error('Login failed:', error)
  }
}
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-center text-blue-600">
          StayEase
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-8">
          Sign in to your account
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-lg px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
<div className="text-right">

  <Link
    to="/forgot-password"
    className="text-sm font-medium text-blue-600 hover:underline"
  >
    Forgot password?
  </Link>

</div>
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg
                       font-semibold hover:bg-blue-700
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Signing in...'
              : 'Sign In'}
          </button>

        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}

          <Link
            to="/register"
            className="text-blue-600 font-medium hover:underline"
          >
            Create account
          </Link>
        </p>

      </div>
    </div>
  )
}

export default LoginPage