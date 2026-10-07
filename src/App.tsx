import { Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import { AdminRoute, CustomerRoute, GuestRoute, ProtectedRoute } from './components/RouteGuards'
import AdminFeedbackDetail from './pages/admin/AdminFeedbackDetail'
import Dashboard from './pages/admin/Dashboard'
import FeedbackDetail from './pages/FeedbackDetail'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Record from './pages/Record'
import ResetPassword from './pages/ResetPassword'
import Signup from './pages/Signup'

export default function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route element={<CustomerRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/record" element={<Record />} />
            <Route path="/feedback/:id" element={<FeedbackDetail />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/feedback/:id" element={<AdminFeedbackDetail />} />
          </Route>
        </Route>
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
