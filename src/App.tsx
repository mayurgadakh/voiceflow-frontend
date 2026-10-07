import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { authClient } from './authClient'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import Signup from './pages/Signup'

export default function App() {
  const { data: session, isPending } = authClient.useSession()
  const [ready, setReady] = useState(false)

  if (!ready && !isPending) setReady(true)

  if (!ready) return <p className="center">Loading...</p>

  return (
    <Routes>
      <Route path="/" element={session ? <Home user={session.user} /> : <Navigate to="/login" />} />
      <Route path="/login" element={session ? <Navigate to="/" /> : <Login />} />
      <Route path="/signup" element={session ? <Navigate to="/" /> : <Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  )
}
