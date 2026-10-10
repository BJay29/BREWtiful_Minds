import { useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { StoreProvider } from './context/StoreContext'
import ProtectedRoute, { FullPageLoader } from './components/ProtectedRoute'
import { homeFor } from './lib/roles'
import Welcome from './pages/Welcome'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import ProfileHub from './pages/shared/ProfileHub'
import AccountEdit from './pages/shared/AccountEdit'
import ChangePassword from './pages/shared/ChangePassword'
import Chat from './pages/shared/Chat'
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

// Hindi naka-login: Welcome page. Naka-login: diretso sa home ng role niya.
function RootRedirect() {
  const { session, profile, loading } = useAuth()
  if (loading || (session && !profile)) return <FullPageLoader />
  if (!session) return <Welcome />
  return <Navigate to={homeFor(profile.role)} replace />
}

// Kapag naka-login at biglang nawala ang session (logout), dalhin sa Login
function LogoutWatcher() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const hadSession = useRef(false)

  useEffect(() => {
    if (loading) return
    if (session) {
      hadSession.current = true
    } else if (hadSession.current) {
      hadSession.current = false
      navigate('/login', { replace: true })
    }
  }, [session, loading, navigate])

  return null
}

const guard = (role, element) => <ProtectedRoute role={role}>{element}</ProtectedRoute>

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StoreProvider>
          <LogoutWatcher />
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="/customer" element={guard('customer', <CustomerHome />)} />
            <Route path="/customer/barista/:id" element={guard('customer', <CustomerBaristaProfile />)} />
            <Route path="/customer/book/:id" element={guard('customer', <CustomerBooking />)} />
            <Route path="/customer/bookings" element={guard('customer', <CustomerMyBookings />)} />
            <Route path="/customer/review/:bookingId" element={guard('customer', <CustomerReview />)} />
            <Route path="/customer/favorites" element={guard('customer', <CustomerFavorites />)} />
            <Route path="/customer/messages" element={guard('customer', <Chat />)} />
            <Route path="/customer/messages/:bookingId" element={guard('customer', <Chat />)} />
            <Route path="/customer/profile" element={guard('customer', <ProfileHub />)} />
            <Route path="/customer/profile/edit" element={guard('customer', <AccountEdit />)} />
            <Route path="/customer/profile/password" element={guard('customer', <ChangePassword />)} />

            <Route path="/barista" element={guard('barista', <BaristaDashboard />)} />
            <Route path="/barista/requests" element={guard('barista', <BaristaRequests />)} />
            <Route path="/barista/reviews" element={guard('barista', <BaristaMyReviews />)} />
            <Route path="/barista/messages" element={guard('barista', <Chat />)} />
            <Route path="/barista/messages/:bookingId" element={guard('barista', <Chat />)} />
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