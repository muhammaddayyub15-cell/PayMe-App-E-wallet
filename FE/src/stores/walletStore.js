import { create } from 'zustand'

const useWalletStore = create((set) => ({
  balance: null,
  currency: 'IDR',
  formatted: null,
  isLoading: false,
  error: null,

  setWallet: (data) => set({
    balance: data.balance,
    currency: data.currency ?? 'IDR',
    formatted: data.formatted ?? null,
    error: null,
  }),

  setLoading: (val) => set({ isLoading: val }),
  setError: (msg) => set({ error: msg }),
  reset: () => set({ balance: null, formatted: null, error: null }),
}))

export default useWalletStore