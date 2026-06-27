import axios from 'axios'
import axiosInstance from './axiosInstance'

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:8000'

const getCsrfCookie = () =>
  axios.get(BASE + '/sanctum/csrf-cookie', { withCredentials: true })

export const login = async (email, password, totpCode) => {
  await getCsrfCookie()
  const payload = totpCode ? { email, password, totp_code: totpCode } : { email, password }
  return axiosInstance.post('/login', payload)
}

export const logout = () =>
  axiosInstance.post('/logout')

export const register = (data) =>
  axiosInstance.post('/register', data)