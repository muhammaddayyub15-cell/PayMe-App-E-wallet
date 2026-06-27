import { useEffect, useCallback } from 'react'
import useWalletStore from '../stores/walletStore'
import useToastStore from '../stores/toastStore'
import { getBalance } from '../api/walletApi'

export default function useWallet() {
  const { balance, formatted, isLoading, error, setWallet, setLoading, setError } = useWalletStore()
  const { addToast } = useToastStore()

  const fetchWallet = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getBalance()
      setWallet(res.data.data)
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Gagal memuat saldo.'
      setError(msg)
      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWallet()
  }, [fetchWallet])

const topUp = useCallback(async (amount) => {
    const res = await import('../api/walletApi').then(m => m.topUp(amount))
    setWallet(res.data.data)
    return res
  }, [])

  return { balance, formatted, isLoading, error, refetch: fetchWallet, topUp }
}

