import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import api from '../api/axios'

interface AdminDashboard {
  totalUsers: number
  totalCustomers: number
  totalManagers: number
  totalAdmins: number
  totalHotels: number
  activeHotels: number
  inactiveHotels: number
  totalRooms: number
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  cancelledBookings: number
  completedBookings: number
  totalPayments: number
  totalRevenue: number
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function AdminDashboardPage() {
  const navigate = useNavigate()

  const [dashboard, setDashboard] =
    useState<AdminDashboard | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setError('')

        const response =
          await api.get<ApiResponse<AdminDashboard>>(
            '/api/admin/dashboard',
          )

        setDashboard(response.data.data)
      } catch (err: any) {
        console.error(
          'Failed to load admin dashboard:',
          err,
        )

        setError(
          err.response?.data?.message ||
            'Failed to load admin dashboard',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">
          Loading admin dashboard...
        </p>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-xl bg-white p-8 shadow">
          <p className="text-red-600">
            {error || 'Dashboard data not available'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              StayEase
            </h1>

            <p className="text-sm text-gray-500">
              Admin Dashboard
            </p>
          </div>

          <nav className="flex items-center gap-3">

            <Link
              to="/admin/users"
              className="rounded-lg px-4 py-2 font-medium text-gray-700 hover:bg-gray-100"
            >
              Users
            </Link>

            <Link
              to="/admin/hotels"
              className="rounded-lg px-4 py-2 font-medium text-gray-700 hover:bg-gray-100"
            >
              Hotels
            </Link>

            <Link
              to="/admin/bookings"
              className="rounded-lg px-4 py-2 font-medium text-gray-700 hover:bg-gray-100"
            >
              Bookings
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
            >
              Logout
            </button>

          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <h2 className="mb-6 text-3xl font-bold text-gray-800">
          Platform Overview
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            title="Total Users"
            value={dashboard.totalUsers}
          />

          <StatCard
            title="Customers"
            value={dashboard.totalCustomers}
          />

          <StatCard
            title="Hotel Managers"
            value={dashboard.totalManagers}
          />

          <StatCard
            title="Admins"
            value={dashboard.totalAdmins}
          />

          <StatCard
            title="Total Hotels"
            value={dashboard.totalHotels}
          />

          <StatCard
            title="Active Hotels"
            value={dashboard.activeHotels}
          />

          <StatCard
            title="Inactive Hotels"
            value={dashboard.inactiveHotels}
          />

          <StatCard
            title="Total Rooms"
            value={dashboard.totalRooms}
          />

          <StatCard
            title="Total Bookings"
            value={dashboard.totalBookings}
          />

          <StatCard
            title="Pending"
            value={dashboard.pendingBookings}
          />

          <StatCard
            title="Confirmed"
            value={dashboard.confirmedBookings}
          />

          <StatCard
            title="Completed"
            value={dashboard.completedBookings}
          />

          <StatCard
            title="Cancelled"
            value={dashboard.cancelledBookings}
          />

          <StatCard
            title="Payments"
            value={dashboard.totalPayments}
          />

          <StatCard
            title="Revenue"
            value={`€${Number(
              dashboard.totalRevenue || 0,
            ).toFixed(2)}`}
          />

        </div>

      </main>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
}

function StatCard({
  title,
  value,
}: StatCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-gray-800">
        {value}
      </p>
    </div>
  )
}

export default AdminDashboardPage