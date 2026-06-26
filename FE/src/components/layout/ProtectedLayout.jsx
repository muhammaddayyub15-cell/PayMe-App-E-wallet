import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'

export default function ProtectedLayout() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const hasHydrated = useAuthStore.persist?.hasHydrated?.() ?? true

  if (!hasHydrated) return null // tunggu sessionStorage selesai dibaca
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}