import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import ProtectedLayout from '../components/layout/ProtectedLayout'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import DashboardPage from '../pages/home/Dashboard'
import TranslationManager from '../pages/admin/TranslationManager'
import useAuthStore from '../stores/authStore'
import LandingPage from '../pages/LandingPage'

function AdminGuard() {
  const user = useAuthStore(s => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <Outlet />
}

const router = createBrowserRouter([
  { path: '/',         element: <LandingPage /> },
  { path: '/login',    element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },

  {
    element: <ProtectedLayout />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
    ],
  },

  {
    element: <AdminGuard />,
    children: [
      { path: '/admin/translations', element: <TranslationManager /> },
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
])

export default router