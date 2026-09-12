import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Link } from 'react-router-dom'

import api from '../api/axios'

type NotificationStatus =
  | 'UNREAD'
  | 'READ'

type NotificationType =
  | 'ACCOUNT'
  | 'BOOKING_CREATED'
  | 'BOOKING_CANCELLED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'REVIEW'
  | 'GENERAL'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  status: NotificationStatus
  createdAt: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

type FilterOption =
  | 'ALL'
  | 'UNREAD'
  | 'READ'

function NotificationsPage() {
  const [
    notifications,
    setNotifications,
  ] = useState<Notification[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [
    markingId,
    setMarkingId,
  ] = useState<string | null>(
    null,
  )

  const [filter, setFilter] =
    useState<FilterOption>(
      'ALL',
    )

  /*
   * LOAD NOTIFICATIONS
   */
  const fetchNotifications =
    async () => {
      try {
        setLoading(true)
        setError('')

        const response =
          await api.get<
            ApiResponse<
              Notification[]
            >
          >(
            '/api/notifications',
          )

        const data =
          response.data.data ||
          []

        /*
         * Latest notification first
         */
        const sorted =
          [...data].sort(
            (a, b) =>
              new Date(
                b.createdAt,
              ).getTime() -
              new Date(
                a.createdAt,
              ).getTime(),
          )

        setNotifications(
          sorted,
        )
      } catch (err: any) {
        console.error(
          'Failed to load notifications:',
          err,
        )

        setError(
          err.response?.data
            ?.message ||
            'Failed to load notifications.',
        )
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    fetchNotifications()
  }, [])

  /*
   * MARK ONE NOTIFICATION AS READ
   */
  const handleMarkAsRead =
    async (
      notificationId: string,
    ) => {
      try {
        setMarkingId(
          notificationId,
        )

        setError('')

        const response =
          await api.patch<
            ApiResponse<Notification>
          >(
            `/api/notifications/${notificationId}/read`,
          )

        const updated =
          response.data.data

        setNotifications(
          (current) =>
            current.map(
              (
                notification,
              ) =>
                notification.id ===
                notificationId
                  ? updated
                  : notification,
            ),
        )
      } catch (err: any) {
        console.error(
          'Failed to mark notification as read:',
          err,
        )

        setError(
          err.response?.data
            ?.message ||
            'Failed to mark notification as read.',
        )
      } finally {
        setMarkingId(null)
      }
    }

  /*
   * COUNTS
   */
  const unreadCount =
    notifications.filter(
      (notification) =>
        notification.status ===
        'UNREAD',
    ).length

  const readCount =
    notifications.filter(
      (notification) =>
        notification.status ===
        'READ',
    ).length

  /*
   * FILTERED LIST
   */
  const filteredNotifications =
    useMemo(() => {
      if (
        filter === 'UNREAD'
      ) {
        return notifications.filter(
          (notification) =>
            notification.status ===
            'UNREAD',
        )
      }

      if (
        filter === 'READ'
      ) {
        return notifications.filter(
          (notification) =>
            notification.status ===
            'READ',
        )
      }

      return notifications
    }, [
      notifications,
      filter,
    ])

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}

      <header className="bg-white shadow-sm">

        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">

          <div>

            <h1 className="text-2xl font-bold text-blue-600">
              StayEase
            </h1>

            <p className="text-sm text-gray-500">
              Notifications
            </p>

          </div>

          <Link
            to="/customer/dashboard"
            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
          >
            Dashboard
          </Link>

        </div>

      </header>

      {/* MAIN */}

      <main className="mx-auto max-w-5xl px-6 py-8">

        {/* TITLE */}

        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>

            <h2 className="text-3xl font-bold text-gray-900">
              Notifications
            </h2>

            <p className="mt-1 text-gray-500">
              Stay updated about your bookings, payments and account activity.
            </p>

          </div>

          <div className="w-fit rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
            {unreadCount}{' '}
            unread
          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* FILTER BAR */}

        {!loading &&
          notifications.length >
            0 && (
            <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">

              <div className="flex flex-wrap gap-3">

                <FilterButton
                  active={
                    filter === 'ALL'
                  }
                  onClick={() =>
                    setFilter('ALL')
                  }
                >
                  All (
                  {
                    notifications.length
                  }
                  )
                </FilterButton>

                <FilterButton
                  active={
                    filter ===
                    'UNREAD'
                  }
                  onClick={() =>
                    setFilter(
                      'UNREAD',
                    )
                  }
                >
                  Unread (
                  {unreadCount})
                </FilterButton>

                <FilterButton
                  active={
                    filter ===
                    'READ'
                  }
                  onClick={() =>
                    setFilter(
                      'READ',
                    )
                  }
                >
                  Read (
                  {readCount})
                </FilterButton>

              </div>

            </div>
          )}

        {/* LOADING */}

        {loading && (
          <div className="rounded-xl bg-white p-8 text-center shadow">

            <p className="text-gray-600">
              Loading notifications...
            </p>

          </div>
        )}

        {/* NO NOTIFICATIONS */}

        {!loading &&
          notifications.length ===
            0 && (
            <div className="rounded-xl bg-white p-10 text-center shadow">

              <div className="text-5xl">
                🔔
              </div>

              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                No notifications
              </h3>

              <p className="mt-2 text-gray-500">
                Your booking, payment and account notifications will appear here.
              </p>

              <Link
                to="/hotels/search"
                className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Search Hotels
              </Link>

            </div>
          )}

        {/* FILTER EMPTY */}

        {!loading &&
          notifications.length >
            0 &&
          filteredNotifications.length ===
            0 && (
            <div className="rounded-xl bg-white p-8 text-center shadow">

              <p className="text-gray-500">
                No {filter.toLowerCase()}{' '}
                notifications.
              </p>

            </div>
          )}

        {/* NOTIFICATION LIST */}

        {!loading && (
          <div className="space-y-4">

            {filteredNotifications.map(
              (
                notification,
              ) => (
                <div
                  key={
                    notification.id
                  }
                  className={`rounded-xl border p-5 shadow-sm transition ${
                    notification.status ===
                    'UNREAD'
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >

                  <div className="flex flex-col justify-between gap-4 md:flex-row">

                    {/* LEFT */}

                    <div className="flex gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                        {getNotificationIcon(
                          notification.type,
                        )}
                      </div>

                      <div>

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="text-lg font-semibold text-gray-900">
                            {
                              notification.title
                            }
                          </h3>

                          {notification.status ===
                            'UNREAD' && (
                            <span className="rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
                              NEW
                            </span>
                          )}

                        </div>

                        <p className="mt-2 leading-6 text-gray-700">
                          {
                            notification.message
                          }
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3">

                          <span className="text-sm text-gray-500">
                            {formatDate(
                              notification.createdAt,
                            )}
                          </span>

                          <NotificationTypeBadge
                            type={
                              notification.type
                            }
                          />

                        </div>

                      </div>

                    </div>

                    {/* ACTION */}

                    {notification.status ===
                      'UNREAD' && (
                      <div className="shrink-0">

                        <button
                          type="button"
                          onClick={() =>
                            handleMarkAsRead(
                              notification.id,
                            )
                          }
                          disabled={
                            markingId ===
                            notification.id
                          }
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                          {markingId ===
                          notification.id
                            ? 'Updating...'
                            : 'Mark as Read'}
                        </button>

                      </div>
                    )}

                  </div>

                </div>
              ),
            )}

          </div>
        )}

      </main>

    </div>
  )
}

/*
 * FILTER BUTTON
 */
interface FilterButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

function FilterButton({
  active,
  onClick,
  children,
}: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  )
}

/*
 * TYPE BADGE
 */
function NotificationTypeBadge({
  type,
}: {
  type: NotificationType
}) {
  return (
    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">
      {formatNotificationType(
        type,
      )}
    </span>
  )
}

/*
 * ICON
 */
function getNotificationIcon(
  type: NotificationType,
) {
  switch (type) {
    case 'BOOKING_CREATED':
      return '🏨'

    case 'BOOKING_CANCELLED':
      return '❌'

    case 'PAYMENT_SUCCESS':
      return '✅'

    case 'PAYMENT_FAILED':
      return '⚠️'

    case 'REVIEW':
      return '⭐'

    case 'ACCOUNT':
      return '👤'

    default:
      return '🔔'
  }
}

/*
 * FRIENDLY TYPE NAME
 */
function formatNotificationType(
  type: NotificationType,
) {
  switch (type) {
    case 'BOOKING_CREATED':
      return 'Booking'

    case 'BOOKING_CANCELLED':
      return 'Cancellation'

    case 'PAYMENT_SUCCESS':
      return 'Payment'

    case 'PAYMENT_FAILED':
      return 'Payment'

    case 'REVIEW':
      return 'Review'

    case 'ACCOUNT':
      return 'Account'

    default:
      return 'General'
  }
}

/*
 * DATE FORMAT
 */
function formatDate(
  createdAt: string,
) {
  if (!createdAt) {
    return ''
  }

  const date =
    new Date(createdAt)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return ''
  }

  return date.toLocaleString(
    undefined,
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    },
  )
}

export default NotificationsPage