import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { StoreProvider } from './context/StoreContext'
import ProtectedRoute, { FullPageLoader } from './components/ProtectedRoute'
import { homeFor } from './lib/roles'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ProfileHub from './pages/shared/ProfileHub'
import AccountEdit from './pages/shared/AccountEdit'
import ChangePassword from './pages/shared/ChangePassword'
import CustomerHome from './pages/customer/Home'
import CustomerBaristaProfile from './pages/customer/BaristaProfile'
import CustomerBooking from './pages/customer/Booking'
import CustomerMyBookings from './pages/customer/Mybookings'
import CustomerReview from './pages/customer/Review'
import CustomerFavorites from './pages/customer/Favorites'
import BaristaDashboard from './pages/barista/Dashboard'
import BaristaRequests from './pages/barista/Requests'
import BaristaMyReviews from './pages/barista/MyReviews'
import BaristaEditProfile from './pages/barista/EditProfile'

function RootRedirect() {
  const { session, profile, loading } = useAuth()
  if (loading || (session && !profile)) return <FullPageLoader />
  if (!session) return <Navigate to="/login" replace />
  return <Navigate to={homeFor(profile.role)} replace />
}

const guard = (role, element) => <ProtectedRoute role={role}>{element}</ProtectedRoute>

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StoreProvider>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/customer" element={guard('customer', <CustomerHome />)} />
            <Route path="/customer/barista/:id" element={guard('customer', <CustomerBaristaProfile />)} />
            <Route path="/customer/book/:id" element={guard('customer', <CustomerBooking />)} />
            <Route path="/customer/bookings" element={guard('customer', <CustomerMyBookings />)} />
            <Route path="/customer/review/:bookingId" element={guard('customer', <CustomerReview />)} />
            <Route path="/customer/favorites" element={guard('customer', <CustomerFavorites />)} />
            <Route path="/customer/profile" element={guard('customer', <ProfileHub />)} />
            <Route path="/customer/profile/edit" element={guard('customer', <AccountEdit />)} />
            <Route path="/customer/profile/password" element={guard('customer', <ChangePassword />)} />

            <Route path="/barista" element={guard('barista', <BaristaDashboard />)} />
            <Route path="/barista/requests" element={guard('barista', <BaristaRequests />)} />
            <Route path="/barista/reviews" element={guard('barista', <BaristaMyReviews />)} />
            <Route path="/barista/profile" element={guard('barista', <ProfileHub />)} />
            <Route path="/barista/profile/edit" element={guard('barista', <BaristaEditProfile />)} />
            <Route path="/barista/profile/account" element={guard('barista', <AccountEdit />)} />
            <Route path="/barista/profile/password" element={guard('barista', <ChangePassword />)} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}