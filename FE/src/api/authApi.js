import axiosInstance from './axiosInstance'

export const login = (email, password) =>
  axiosInstance.post('/login', { email, password })

export const logout = () =>
  axiosInstance.post('/logout')

export const refreshToken = () =>
  axiosInstance.post('/refresh')

export const register = (data) =>
  axiosInstance.post('/register', data)