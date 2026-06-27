import { useState, useCallback } from 'react'
import useToastStore from '../stores/toastStore'
import { getTransactions } from '../api/transactionApi'

export default function useTransactions() {
  const [transactions, setTransactions] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const { addToast } = useToastStore()

  const fetchTransactions = useCallback(async (p = 1) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await getTransactions(p)
      const { data, meta: m } = res.data
      setTransactions(p === 1 ? data : prev => [...prev, ...data])
      setMeta({
        current_page: Array.isArray(m.current_page) ? m.current_page[0] : m.current_page,
        last_page: Array.isArray(m.last_page) ? m.last_page[0] : m.last_page,
        per_page: Array.isArray(m.per_page) ? m.per_page[0] : m.per_page,
        total: Array.isArray(m.total) ? m.total[0] : m.total,
      })
      setPage(p)
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Gagal memuat transaksi.'
      setError(msg)
      addToast(msg, 'error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadMore = useCallback(() => {
    if (meta && page < meta.last_page) fetchTransactions(page + 1)
  }, [meta, page, fetchTransactions])

  return { transactions, meta, page, isLoading, error, fetchTransactions, loadMore }
}
