import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import Sidebar from '../../components/layout/Sidebar'
import TransactionList from '../../components/shared/TransactionList'
import Toast from '../../components/ui/Toast'
import Modal from '../../components/ui/Modal'
import useTransactions from '../../hooks/useTransactions'

const FILTERS = [
  { key: 'all',          label: 'Semua' },
  { key: 'TRANSFER_IN',  label: 'Masuk' },
  { key: 'TRANSFER_OUT', label: 'Keluar' },
  { key: 'TOPUP',        label: 'Top Up' },
]

export default function HistoryPage() {
  const navigate = useNavigate()
  const [logoutModal, setLogoutModal] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')

  const { transactions, meta, isLoading, fetchTransactions, loadMore } = useTransactions()

  const handleLogout = async () => {
    setLogoutLoading(true)
    try { const { logout } = await import('../../api/authApi'); await logout() } catch {}
    navigate('/login')
    setLogoutLoading(false)
  }

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return transactions
    return transactions.filter(t => t.type === activeFilter)
  }, [transactions, activeFilter])

  return (
    <div className="flex min-h-screen font-nunito" style={{ background: 'var(--clay-bg)' }}>
      <Toast />
      <Sidebar onLogout={() => setLogoutModal(true)} />

      <div className="flex-1 overflow-y-auto min-w-0 pb-20 md:pb-0">
        <div className="max-w-[760px] mx-auto px-4 md:px-6 py-5 md:py-8">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer flex-shrink-0"
              style={{ background: 'var(--clay-surface)', boxShadow: 'var(--clay-shadow-sm)' }}
            >
              <ArrowLeft size={16} color="var(--clay-primary)" strokeWidth={2.5} />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-black" style={{ color: 'var(--clay-text)' }}>Riwayat Transaksi</h1>
              <p className="text-xs font-semibold" style={{ color: 'var(--clay-muted-lt)' }}>{meta?.total ?? 0} total transaksi</p>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-3xl p-4 md:p-5 flex flex-col gap-4"
            style={{ background: 'var(--clay-surface)', boxShadow: 'var(--clay-shadow)' }}>

            {/* Filter tabs — scroll horizontal di mobile */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className="px-4 py-2 rounded-full text-xs font-bold border-none cursor-pointer whitespace-nowrap flex-shrink-0 transition-colors duration-150"
                  style={{
                    background: activeFilter === f.key ? 'var(--clay-primary)' : 'rgba(91,63,219,0.08)',
                    color: activeFilter === f.key ? 'white' : 'var(--clay-primary)',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <TransactionList
              transactions={filtered}
              isLoading={isLoading}
              meta={activeFilter === 'all' ? meta : null}
              onLoadMore={loadMore}
            />
          </div>

        </div>
      </div>

      <Modal isOpen={logoutModal} onClose={() => setLogoutModal(false)} onConfirm={handleLogout}
        title="Keluar dari PayMe?" confirmLabel="Ya, Keluar" isLoading={logoutLoading}>
        <p className="text-sm font-semibold" style={{ color: 'var(--clay-primary)' }}>
          Sesi kamu akan diakhiri. Kamu perlu login kembali untuk mengakses saldo.
        </p>
      </Modal>
    </div>
  )
}