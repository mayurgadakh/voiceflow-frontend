import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import { FullPageLoader } from './components/FullPageLoader'
import { AdminRoute, CustomerRoute, GuestRoute, ProtectedRoute } from './components/RouteGuards'
import FeedbackDetail from './pages/FeedbackDetail'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Record from './pages/Record'
import ResetPassword from './pages/ResetPassword'
import Signup from './pages/Signup'

// Admin pages (and the charting library) are only downloaded by admins
const Overview = lazy(() => import('./pages/admin/Overview'))
const AdminFeedbackList = lazy(() => import('./pages/admin/FeedbackList'))
const AdminFeedbackDetail = lazy(() => import('./pages/admin/FeedbackDetail'))

export default function App() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route element={<CustomerRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/record" element={<Record />} />
              <Route path="/feedback/:id" element={<FeedbackDetail />} />
            </Route>
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Overview />} />
              <Route path="/admin/feedback" element={<AdminFeedbackList />} />
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
    </Suspense>
  )
}
