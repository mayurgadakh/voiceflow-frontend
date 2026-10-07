import { Navigate, Outlet } from 'react-router-dom'
import { authClient } from '../lib/authClient'

// Waits for the first session lookup so guards never redirect on a stale "logged out" state
function useSessionGate() {
  const { data: session, isPending } = authClient.useSession()
  return { session, isPending }
}

export function ProtectedRoute() {
  const { session, isPending } = useSessionGate()
  if (isPending) return <p className="center">Loading...</p>
  return session ? <Outlet /> : <Navigate to="/login" replace />
}

export function GuestRoute() {
  const { session, isPending } = useSessionGate()
  if (isPending) return <p className="center">Loading...</p>
  return session ? <Navigate to="/" replace /> : <Outlet />
}
