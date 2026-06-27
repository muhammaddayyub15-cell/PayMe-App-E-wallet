import axiosInstance from './axiosInstance'

// ── Setup & Manajemen TOTP (dipanggil dari ProfilePage / TotpSetupCard)
export const setupTotp = () =>
    axiosInstance.post('/2fa/setup')

export const confirmTotp = (code) =>
    axiosInstance.post('/2fa/confirm', { code })

export const disableTotp = (password) =>
    axiosInstance.post('/2fa/disable', { password })

// ── Verify saat login step 2 (dipanggil dari LoginPage)
export const verifyTotp = (code) =>
    axiosInstance.post('/2fa/verify-totp', { code })