// src/api/transactionApi.js
import axiosInstance from './axiosInstance'

export const getTransactions = (page = 1) =>
  axiosInstance.get('/transactions', { params: { page } })

export const transfer = (receiverIdentifier, amount) =>
  axiosInstance.post('/transfer', { receiver_identifier: receiverIdentifier, amount })