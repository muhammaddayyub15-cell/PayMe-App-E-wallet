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

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status

    // 401 → clear auth state + redirect login
    if (status === 401) {
      // lazy import untuk hindari circular dependency
      import('../stores/authStore').then(({ default: useAuthStore }) => {
        useAuthStore.getState().clear()
      })
      window.location.href = '/login'
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