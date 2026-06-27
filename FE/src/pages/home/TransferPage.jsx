import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import Sidebar from '../../components/layout/Sidebar'
import TransferForm from '../../components/shared/TransferForm'
import QuickTransferBar from '../../components/shared/QuickTransferBar'
import Toast from '../../components/ui/Toast'
import Modal from '../../components/ui/Modal'
import useWallet from '../../hooks/useWallet'
import useTransactions from '../../hooks/useTransactions'

export default function TransferPage() {
  const navigate = useNavigate()
  const [logoutModal, setLogoutModal] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [defaultReceiver, setDefaultReceiver] = useState('')

  const { refetch: refetchWallet } = useWallet()
  const { transactions, fetchTransactions } = useTransactions()

  const handleLogout = async () => {
    setLogoutLoading(true)
    try { const { logout } = await import('../../api/authApi'); await logout() } catch {}
    navigate('/login')
    setLogoutLoading(false)
  }

  const handleSuccess = () => {
    refetchWallet()
    fetchTransactions(1)
    navigate('/dashboard')
  }

  const handleQuickTransfer = (name) => setDefaultReceiver(name)

  return (
    <div className="flex min-h-screen font-nunito" style={{ background: 'var(--clay-bg)' }}>
      <Toast />
      <Sidebar onLogout={() => setLogoutModal(true)} />

      <div className="flex-1 overflow-y-auto min-w-0 pb-20 md:pb-0">
        <div className="max-w-[640px] mx-auto px-4 md:px-6 py-5 md:py-8">

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
              <h1 className="text-xl md:text-2xl font-black" style={{ color: 'var(--clay-text)' }}>Transfer</h1>
              <p className="text-xs font-semibold" style={{ color: 'var(--clay-muted-lt)' }}>Kirim saldo ke pengguna lain</p>
            </div>
          </div>

          {/* Quick transfer — penerima terakhir */}
          <div className="mb-5">
            <QuickTransferBar transactions={transactions} onTransfer={handleQuickTransfer} />
          </div>

          {/* Form */}
          <div className="rounded-3xl p-5 md:p-6" style={{ background: 'var(--clay-surface)', boxShadow: 'var(--clay-shadow)' }}>
            <TransferForm
              onSuccess={handleSuccess}
              onCancel={() => navigate('/dashboard')}
              defaultReceiver={defaultReceiver}
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