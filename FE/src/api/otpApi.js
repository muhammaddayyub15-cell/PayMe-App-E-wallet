import axiosInstance from './axiosInstance';

export const sendOtp = () =>
    axiosInstance.post('/otp/send');

export const verifyOtp = (code) =>
    axiosInstance.post('/otp/verify', { code });