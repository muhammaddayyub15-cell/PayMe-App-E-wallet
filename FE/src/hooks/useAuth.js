import { useCallback } from 'react'
import { login as loginApi, logout as logoutApi } from '../api/authApi'
import useAuthStore from '../stores/authStore'
import useWalletStore from '../stores/walletStore'

export default function useAuth() {
  const { user, isAuthenticated, setUser, clear } = useAuthStore()
  const resetWallet = useWalletStore(s => s.reset)

  const login = useCallback(async (email, password) => {
    const res = await loginApi(email, password)
    setUser(res.data.data)
    return res
  }, [setUser])

  const logout = useCallback(async () => {
    try { await logoutApi() } catch { /* tetap clear meski API gagal */ }
    clear()
    resetWallet()
  }, [clear, resetWallet])

  return { user, isAuthenticated, login, logout }
}