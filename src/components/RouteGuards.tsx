import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { authClient } from '../lib/authClient'

// useSession flips isPending back to true on every refetch (e.g. tab refocus).
// Only the very first lookup should block rendering, so latch once it has finished.
function useSessionGate() {
  const { data: session, isPending } = authClient.useSession()
  const [ready, setReady] = useState(false)
  if (!ready && !isPending) setReady(true)
  return { session, ready }
}

export function ProtectedRoute() {
  const { session, ready } = useSessionGate()
  if (!ready) return <p className="center">Loading...</p>
  return session ? <Outlet /> : <Navigate to="/login" replace />
}

export function GuestRoute() {
  const { session, ready } = useSessionGate()
  if (!ready) return <p className="center">Loading...</p>
  return session ? <Navigate to="/" replace /> : <Outlet />
}

// Convenience only: the API enforces admin access on every request
export function AdminRoute() {
  const { session, ready } = useSessionGate()
  if (!ready) return <p className="center">Loading...</p>
  return session?.user.role === 'admin' ? <Outlet /> : <Navigate to="/" replace />
}

// Recording and "my feedback" are for customers. Admins work from /admin
export function CustomerRoute() {
  const { session, ready } = useSessionGate()
  if (!ready) return <p className="center">Loading...</p>
  return session?.user.role === 'admin' ? <Navigate to="/admin" replace /> : <Outlet />
}
