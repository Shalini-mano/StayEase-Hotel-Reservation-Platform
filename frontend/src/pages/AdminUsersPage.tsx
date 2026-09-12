import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import api from '../api/axios'

type Role =
  | 'CUSTOMER'
  | 'HOTEL_MANAGER'
  | 'ADMIN'

interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: Role
  enabled: boolean
}

interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function AdminUsersPage() {
  const [users, setUsers] =
    useState<AdminUser[]>([])

  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] =
    useState(0)

  const [totalElements, setTotalElements] =
    useState(0)

  const [role, setRole] =
    useState('')

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const pageSize = 10

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError('')

      const params: Record<string, any> = {
        page,
        size: pageSize,
        sortBy: 'createdAt',
        direction: 'desc',
      }

      if (role) {
        params.role = role
      }

      const response =
        await api.get<
          ApiResponse<PageResponse<AdminUser>>
        >('/api/admin/users', {
          params,
        })

      const data = response.data.data

      setUsers(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (err: any) {
      console.error(
        'Failed to load users:',
        err,
      )

      setError(
        err.response?.data?.message ||
          'Failed to load users',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, role])

  const handleRoleChange = (
    value: string,
  ) => {
    setRole(value)
    setPage(0)
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
              Admin User Management
            </p>
          </div>

          <Link
            to="/admin/dashboard"
            className="rounded-lg bg-gray-600 px-5 py-2 font-medium text-white hover:bg-gray-700"
          >
            Back to Dashboard
          </Link>

        </div>

      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">

        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Users
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Total Users: {totalElements}
            </p>
          </div>

          <div className="flex items-center gap-3">

            <label className="text-sm font-medium text-gray-700">
              Filter by Role
            </label>

            <select
              value={role}
              onChange={(event) =>
                handleRoleChange(
                  event.target.value,
                )
              }
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                All Roles
              </option>

              <option value="CUSTOMER">
                Customer
              </option>

              <option value="HOTEL_MANAGER">
                Hotel Manager
              </option>

              <option value="ADMIN">
                Admin
              </option>
            </select>

          </div>

        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-xl bg-white shadow">

          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead className="bg-gray-50">

                  <tr>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Name
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Email
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Role
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-200">

                  {users.map((user) => (

                    <tr
                      key={user.id}
                      className="hover:bg-gray-50"
                    >

                      <td className="whitespace-nowrap px-6 py-4">

                        <div className="font-medium text-gray-900">
                          {user.firstName}{' '}
                          {user.lastName}
                        </div>

                        <div className="text-xs text-gray-400">
                          {user.id}
                        </div>

                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {user.email}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {user.phone || '-'}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">

                        <RoleBadge
                          role={user.role}
                        />

                      </td>

                      <td className="whitespace-nowrap px-6 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            user.enabled
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {user.enabled
                            ? 'Enabled'
                            : 'Disabled'}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {!loading &&
          totalPages > 0 && (
            <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">

              <p className="text-sm text-gray-600">
                Page {page + 1} of{' '}
                {totalPages}
              </p>

              <div className="flex gap-2">

                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() =>
                    setPage(
                      (currentPage) =>
                        currentPage - 1,
                    )
                  }
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={
                    page >= totalPages - 1
                  }
                  onClick={() =>
                    setPage(
                      (currentPage) =>
                        currentPage + 1,
                    )
                  }
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>

              </div>

            </div>
          )}

      </main>

    </div>
  )
}

function RoleBadge({
  role,
}: {
  role: Role
}) {
  const style =
    role === 'ADMIN'
      ? 'bg-purple-100 text-purple-700'
      : role === 'HOTEL_MANAGER'
        ? 'bg-blue-100 text-blue-700'
        : 'bg-gray-100 text-gray-700'

  const label =
    role === 'HOTEL_MANAGER'
      ? 'Hotel Manager'
      : role === 'CUSTOMER'
        ? 'Customer'
        : 'Admin'

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  )
}

export default AdminUsersPage