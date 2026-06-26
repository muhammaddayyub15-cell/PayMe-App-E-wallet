import axiosInstance from './axiosInstance'

export const getBalance = () =>
  axiosInstance.get('/wallet')

export const topUp = (amount) =>
  axiosInstance.post('/topup', { amount })

export const createQrisCharge = (amount) =>
  axiosInstance.post('/topup/create-charge', { amount })