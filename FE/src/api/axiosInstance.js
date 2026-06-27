import axios from 'axios'
import { generateIdempotencyKey } from '../utils/idempotency'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
})

axiosInstance.interceptors.request.use((config) => {
  if (config.url?.includes('/transfer') && config.method === 'post') {
    if (!config._idempotencyKey) {
      config._idempotencyKey = generateIdempotencyKey()
    }
    config.headers['X-Idempotency-Key'] = config._idempotencyKey
  }
  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status

    if (status === 401) {
      const { default: useAuthStore } = await import('../stores/authStore')
      useAuthStore.getState().clear()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (status === 429) {
      const retryAfter = error.response?.headers['retry-after']
      error.retryAfter = retryAfter ? Math.ceil(retryAfter / 60) : null
    }

    return Promise.reject(error)
  }
)

export default axiosInstance