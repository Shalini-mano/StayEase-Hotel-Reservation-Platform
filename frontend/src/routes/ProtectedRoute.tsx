import {
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import {
  Navigate,
} from 'react-router-dom'

import api from '../api/axios'

type Role =
  | 'CUSTOMER'
  | 'HOTEL_MANAGER'
  | 'ADMIN'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: Role
  enabled: boolean
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: Role[]
}

function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const token =
    localStorage.getItem('token')

  const [user, setUser] =
    useState<User | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [invalidToken, setInvalidToken] =
    useState(false)

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response =
          await api.get<ApiResponse<User>>(
            '/api/users/profile',
          )

        setUser(response.data.data)
      } catch (error) {
        console.error(
          'Failed to verify user:',
          error,
        )

        localStorage.removeItem('token')

        setInvalidToken(true)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [token])

  if (!token || invalidToken) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">
          Checking access...
        </p>
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    if (user.role === 'ADMIN') {
      return (
        <Navigate
          to="/admin/dashboard"
          replace
        />
      )
    }

    if (
      user.role ===
      'HOTEL_MANAGER'
    ) {
      return (
        <Navigate
          to="/manager/dashboard"
          replace
        />
      )
    }

    return (
      <Navigate
        to="/customer/dashboard"
        replace
      />
    )
  }

  return children
}

export default ProtectedRoute