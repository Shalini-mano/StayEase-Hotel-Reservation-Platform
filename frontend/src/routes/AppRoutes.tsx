import { Navigate, Route, Routes } from 'react-router-dom'

// Authentication
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'

import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import ResetPasswordPage from '../pages/ResetPasswordPage'

// Customer
import CustomerDashboardPage from '../pages/CustomerDashboardPage'
import ProfilePage from '../pages/ProfilePage'
import HotelSearchPage from '../pages/HotelSearchPage'
import HotelRoomsPage from '../pages/HotelRoomsPage'
import MyBookingsPage from '../pages/MyBookingsPage'
import BookingDetailsPage from '../pages/BookingDetailsPage'
import NotificationsPage from '../pages/NotificationsPage'
import WriteReviewPage from '../pages/WriteReviewPage'
// Manager
import ManagerDashboardPage from '../pages/ManagerDashboardPage'
import ManagerBookingsPage from '../pages/ManagerBookingsPage'
import ManagerHotelsPage from '../pages/ManagerHotelsPage'
import CreateHotelPage from '../pages/CreateHotelPage'
import EditHotelPage from '../pages/EditHotelPage'
import ManagerRoomsPage from '../pages/ManagerRoomsPage'
import CreateRoomPage from '../pages/CreateRoomPage'
import EditRoomPage from '../pages/EditRoomPage'

// Admin
import AdminDashboardPage from '../pages/AdminDashboardPage'
import AdminUsersPage from '../pages/AdminUsersPage'
import AdminHotelsPage from '../pages/AdminHotelsPage'
import AdminBookingsPage from '../pages/AdminBookingsPage'

// Route Protection
import ProtectedRoute from './ProtectedRoute'
import HomePage from '../pages/HomePage'
import PublicHotelSearchPage from '../pages/PublicHotelSearchPage'
import PublicHotelRoomsPage from '../pages/PublicHotelRoomsPage'
import BookingConfirmationPage from '../pages/BookingConfirmationPage'
import PaymentSuccessPage from "../pages/PaymentSuccessPage";

function AppRoutes() {
  return (
    <Routes>

      {/* ========================= */}
      {/* PUBLIC ROUTES */}
      {/* ========================= */}
<Route
  path="/public/hotels/:hotelId/rooms"
  element={<PublicHotelRoomsPage />}
/>
     <Route
       path="/"
       element={<HomePage />}
     />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPasswordPage />}
      />

      <Route
        path="/reset-password"
        element={<ResetPasswordPage />}
      />
<Route
  path="/payment/success"
  element={
    <ProtectedRoute allowedRoles={['CUSTOMER']}>
      <PaymentSuccessPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/search"
  element={<PublicHotelSearchPage />}
/>
      {/* ========================= */}
      {/* CUSTOMER ROUTES */}
      {/* ========================= */}

      <Route
        path="/customer/dashboard"
        element={
          <ProtectedRoute
            allowedRoles={['CUSTOMER']}
          >
            <CustomerDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute
            allowedRoles={['CUSTOMER']}
          >
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/hotels/search"
        element={
          <ProtectedRoute
            allowedRoles={['CUSTOMER']}
          >
            <HotelSearchPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/hotels/:hotelId/rooms"
        element={
          <ProtectedRoute
            allowedRoles={['CUSTOMER']}
          >
            <HotelRoomsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bookings"
        element={
          <ProtectedRoute
            allowedRoles={['CUSTOMER']}
          >
            <MyBookingsPage />
          </ProtectedRoute>
        }
      />
<Route
  path="/bookings/:bookingId/review"
  element={
    <ProtectedRoute
      allowedRoles={['CUSTOMER']}
    >
      <WriteReviewPage />
    </ProtectedRoute>
  }
/>
      <Route
        path="/bookings/:bookingId"
        element={
          <ProtectedRoute
            allowedRoles={['CUSTOMER']}
          >
            <BookingDetailsPage />
          </ProtectedRoute>
        }
      />
<Route
  path="/booking/confirm"
  element={
    <ProtectedRoute
      allowedRoles={['CUSTOMER']}
    >
      <BookingConfirmationPage />
    </ProtectedRoute>
  }
/>
      <Route
        path="/notifications"
        element={
          <ProtectedRoute
            allowedRoles={['CUSTOMER']}
          >
            <NotificationsPage />
          </ProtectedRoute>
        }
      />


      {/* ========================= */}
      {/* HOTEL MANAGER ROUTES */}
      {/* ========================= */}

      <Route
        path="/manager/dashboard"
        element={
          <ProtectedRoute
            allowedRoles={['HOTEL_MANAGER']}
          >
            <ManagerDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/bookings"
        element={
          <ProtectedRoute
            allowedRoles={['HOTEL_MANAGER']}
          >
            <ManagerBookingsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/hotels"
        element={
          <ProtectedRoute
            allowedRoles={['HOTEL_MANAGER']}
          >
            <ManagerHotelsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/hotels/create"
        element={
          <ProtectedRoute
            allowedRoles={['HOTEL_MANAGER']}
          >
            <CreateHotelPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/hotels/:hotelId/edit"
        element={
          <ProtectedRoute
            allowedRoles={['HOTEL_MANAGER']}
          >
            <EditHotelPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/hotels/:hotelId/rooms"
        element={
          <ProtectedRoute
            allowedRoles={['HOTEL_MANAGER']}
          >
            <ManagerRoomsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/hotels/:hotelId/rooms/create"
        element={
          <ProtectedRoute
            allowedRoles={['HOTEL_MANAGER']}
          >
            <CreateRoomPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/hotels/:hotelId/rooms/:roomId/edit"
        element={
          <ProtectedRoute
            allowedRoles={['HOTEL_MANAGER']}
          >
            <EditRoomPage />
          </ProtectedRoute>
        }
      />


      {/* ========================= */}
      {/* ADMIN ROUTES */}
      {/* ========================= */}

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute
            allowedRoles={['ADMIN']}
          >
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute
            allowedRoles={['ADMIN']}
          >
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/hotels"
        element={
          <ProtectedRoute
            allowedRoles={['ADMIN']}
          >
            <AdminHotelsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute
            allowedRoles={['ADMIN']}
          >
            <AdminBookingsPage />
          </ProtectedRoute>
        }
      />


      {/* ========================= */}
      {/* UNKNOWN ROUTE */}
      {/* ========================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

    </Routes>
  )
}

export default AppRoutes