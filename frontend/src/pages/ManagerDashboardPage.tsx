import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import api from '../api/axios'
import type { AppDispatch } from '../app/store'
import { logout } from '../features/auth/authSlice'

interface ManagerDashboard {
  totalHotels: number
  totalRooms: number
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  cancelledBookings: number
  completedBookings: number
  totalRevenue: number
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function ManagerDashboardPage() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const [dashboard, setDashboard] =
    useState<ManagerDashboard | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboard = async () => {
    try {
      setError('')

      const response =
        await api.get<ApiResponse<ManagerDashboard>>(
          '/api/manager/dashboard',
        )

      setDashboard(response.data.data)
    } catch (err: any) {
      console.error(
        'Failed to load manager dashboard:',
        err,
      )

      setError(
        err.response?.data?.message ||
          'Failed to load manager dashboard',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600 text-lg">
          Loading manager dashboard...
        </p>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">

        <div className="rounded-xl bg-white p-6 text-center shadow">

          <p className="mb-4 text-red-600">
            {error ||
              'Unable to load manager dashboard'}
          </p>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
          >
            Back to Login
          </button>

        </div>

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}
      <header className="bg-white shadow-sm">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              StayEase
            </h1>

            <p className="text-sm text-gray-500">
              Hotel Manager Dashboard
            </p>
          </div>

          <div className="flex items-center gap-3">
          <Link
            to="/manager/hotels"
            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
          >
            Hotels
          </Link>

            <Link
              to="/manager/bookings"
              className="rounded-lg bg-purple-600 px-5 py-2 font-medium text-white hover:bg-purple-700"
            >
              Bookings
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-5 py-2 font-medium text-white hover:bg-red-700"
            >
              Logout
            </button>

          </div>

        </div>

      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-7xl px-6 py-8">

        <h2 className="mb-8 text-3xl font-bold text-gray-800">
          Manager Overview
        </h2>

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* MAIN CARDS */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <DashboardCard
            title="Total Hotels"
            value={dashboard.totalHotels}
          />

          <DashboardCard
            title="Total Rooms"
            value={dashboard.totalRooms}
          />

          <DashboardCard
            title="Total Bookings"
            value={dashboard.totalBookings}
          />

          <DashboardCard
            title="Total Revenue"
            value={`€${Number(
              dashboard.totalRevenue || 0,
            ).toFixed(2)}`}
          />

        </div>

        {/* BOOKING STATUS */}
        <div className="rounded-xl bg-white p-6 shadow">

          <h3 className="mb-6 text-xl font-semibold text-gray-800">
            Booking Status
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <StatusCard
              title="Pending"
              value={dashboard.pendingBookings}
              type="pending"
            />

            <StatusCard
              title="Confirmed"
              value={dashboard.confirmedBookings}
              type="confirmed"
            />

            <StatusCard
              title="Completed"
              value={dashboard.completedBookings}
              type="completed"
            />

            <StatusCard
              title="Cancelled"
              value={dashboard.cancelledBookings}
              type="cancelled"
            />

          </div>

        </div>

      </main>

    </div>
  )
}

interface DashboardCardProps {
  title: string
  value: string | number
}

function DashboardCard({
  title,
  value,
}: DashboardCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-gray-800">
        {value}
      </p>

    </div>
  )
}

interface StatusCardProps {
  title: string
  value: number
  type:
    | 'pending'
    | 'confirmed'
    | 'completed'
    | 'cancelled'
}

function StatusCard({
  title,
  value,
  type,
}: StatusCardProps) {
  let style =
    'bg-gray-100 text-gray-700'

  if (type === 'pending') {
    style =
      'bg-yellow-100 text-yellow-700'
  }

  if (type === 'confirmed') {
    style =
      'bg-green-100 text-green-700'
  }

  if (type === 'completed') {
    style =
      'bg-blue-100 text-blue-700'
  }

  if (type === 'cancelled') {
    style =
      'bg-red-100 text-red-700'
  }

  return (
    <div
      className={`rounded-xl p-5 ${style}`}
    >

      <p className="text-sm font-medium">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>

    </div>
  )
}

export default ManagerDashboardPage