import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { homeFor } from '../lib/roles'
import Spinner from './Spinner'

export function FullPageLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center text-[#8A4F1E]">
      <Spinner className="h-8 w-8" />
    </div>
  )
}

export default function ProtectedRoute({ role, children }) {
  const { session, profile, loading } = useAuth()

  if (loading || (session && !profile)) return <FullPageLoader />
  if (!session) return <Navigate to="/login" replace />
  if (profile.role !== role) return <Navigate to={homeFor(profile.role)} replace />

  return children
}