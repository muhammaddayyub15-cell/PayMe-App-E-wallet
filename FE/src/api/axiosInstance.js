import axios from 'axios'
import { generateIdempotencyKey } from '../utils/idempotency'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
  withCredentials: true, // httpOnly cookie dikirim otomatis
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
})

// Request interceptor — tambah idempotency key untuk POST /transfer
axiosInstance.interceptors.request.use((config) => {
  if (config.url?.includes('/transfer') && config.method === 'post') {
    config.headers['X-Idempotency-Key'] = generateIdempotencyKey()
  }
  return config
})

// Shared lock — mencegah beberapa request 401 yang terjadi bersamaan
// (mis. saat dashboard mount dan beberapa hook fetch paralel) memicu
// beberapa panggilan /api/refresh sekaligus, yang saling menghapus
// access_token satu sama lain (lihat AuthService::refreshAccessToken).
let refreshPromise = null

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axiosInstance
      .post('/refresh')
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status
    const originalRequest = error.config

    // 401 → coba refresh access_token sekali sebelum redirect ke login.
    // Endpoint /refresh dan /login sendiri dikecualikan supaya tidak infinite loop.
    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/refresh') &&
      !originalRequest.url?.includes('/login')
    ) {
      originalRequest._retry = true

      try {
        await refreshAccessToken() // semua request 401 paralel menunggu promise YANG SAMA
        return axiosInstance(originalRequest) // ulangi request asli dengan access_token baru
      } catch {
        // refresh_token juga sudah invalid/expired → benar-benar logout
        const { default: useAuthStore } = await import('../stores/authStore')
        useAuthStore.getState().clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    // 429 → tambah info retry ke error object
    if (status === 429) {
      const retryAfter = error.response.headers['retry-after']
      error.retryAfter = retryAfter ? Math.ceil(retryAfter / 60) : null
    }

    return Promise.reject(error)
  }
)

export default axiosInstance