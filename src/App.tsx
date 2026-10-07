import { Route, Routes } from 'react-router-dom'
import { GuestRoute, ProtectedRoute } from './components/RouteGuards'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import ResetPassword from './pages/ResetPassword'
import Signup from './pages/Signup'

export default function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
      </Route>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
