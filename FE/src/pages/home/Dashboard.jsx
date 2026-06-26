import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import useWallet from '../../hooks/useWallet'
import useTransactions from '../../hooks/useTransactions'
import useAuthStore from '../../stores/authStore'

import PageWrapper from '../../components/layout/PageWrapper'
import Navbar from '../../components/layout/Navbar'
import BalanceCard from '../../components/shared/BalanceCard'
import TransactionList from '../../components/shared/TransactionList'
import TopUpForm from '../../components/shared/TopUpForm'
import TransferForm from '../../components/shared/TransferForm'
import Modal from '../../components/ui/Modal'
import Toast from '../../components/ui/Toast'
import Spinner from '../../components/ui/Spinner'
import { formatRupiahShort } from '../../utils/formatCurrency'

// ── Greeting ──────────────────────────────────
function getGreeting() {
  const h = new Date().getHours()
  if (h < 11) return 'Selamat pagi'
  if (h < 15) return 'Selamat siang'
  if (h < 18) return 'Selamat sore'
  return 'Selamat malam'
}

// ── Stats bulan ini (hitung dari data lokal) ──
function StatsRow({ transactions }) {
  const now = new Date()
  const thisMonth = transactions.filter(tx => {
    const d = new Date(tx.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const income  = thisMonth
    .filter(t => t.type === 'TRANSFER_IN' || t.type === 'TOPUP')
    .reduce((s, t) => s + t.amount, 0)
  const outcome = thisMonth
    .filter(t => t.type === 'TRANSFER_OUT')
    .reduce((s, t) => s + t.amount, 0)

  return (
    <div className="grid grid-cols-2 gap-3 mx-4 mb-5">
      <div className="clay-card bg-white/75 rounded-3xl p-4">
        <div className="text-[10px] font-black text-[#9589c8] tracking-wide mb-1">MASUK</div>
        <div className="text-lg font-black text-[#3d2f8a]">{formatRupiahShort(income)}</div>
        <div className="text-[10px] font-bold text-[#10b981] mt-0.5">{thisMonth.length} transaksi</div>
      </div>
      <div className="clay-card bg-white/75 rounded-3xl p-4">
        <div className="text-[10px] font-black text-[#9589c8] tracking-wide mb-1">KELUAR</div>
        <div className="text-lg font-black text-[#3d2f8a]">{formatRupiahShort(outcome)}</div>
        <div className="text-[10px] font-bold text-[#ef4444] mt-0.5">Transfer out</div>
      </div>
    </div>
  )
}

// ── Quick Action Button ───────────────────────
function QABtn({ label, iconClass, icon, onClick }) {
  return (
    <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={onClick}>
      <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center text-xl ${iconClass}`}>
        {icon}
      </div>
      <span className="text-[11px] font-black text-[#6b5fb5]">{label}</span>
    </div>
  )
}

// ── Main Component ────────────────────────────
export default function DashboardPage() {
  const navigate     = useNavigate()
  const user         = useAuthStore(s => s.user)
  const clearAuth    = useAuthStore(s => s.clear)

  const { balance, isLoading: walletLoading, refetch: refetchWallet } = useWallet()
  const { transactions, meta, isLoading: txLoading, fetchTransactions, loadMore } = useTransactions()

  const [activeTab, setActiveTab]       = useState('home')
  const [showTopUp, setShowTopUp]       = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [logoutModal, setLogoutModal]   = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)

  useEffect(() => { fetchTransactions(1) }, [fetchTransactions])

  const handleLogout = async () => {
    setLogoutLoading(true)
    try {
      const { logout } = await import('../../api/authApi')
      await logout()
    } catch { /* tetap clear */ }
    clearAuth()
    navigate('/login')
    setLogoutLoading(false)
  }

  const handleTopUpSuccess = () => {
    setShowTopUp(false)
    refetchWallet()
    fetchTransactions(1)
  }

  const handleTransferSuccess = () => {
    setShowTransfer(false)
    refetchWallet()
    fetchTransactions(1)
  }

  const userName   = user?.name ?? 'Pengguna'
  const lowBalance = balance !== null && balance < 10000

  return (
    <PageWrapper>
      <Toast />

      {/* Logout modal */}
      <Modal
        isOpen={logoutModal}
        onClose={() => setLogoutModal(false)}
        onConfirm={handleLogout}
        title="Keluar dari PayMe?"
        confirmLabel="Ya, Keluar"
        isLoading={logoutLoading}
      >
        <p className="text-sm font-semibold text-[#6b5fb5] leading-relaxed">
          Sesi kamu akan diakhiri. Kamu perlu login kembali untuk mengakses saldo.
        </p>
      </Modal>

      {/* TopUp modal */}
      <Modal
        isOpen={showTopUp}
        onClose={() => setShowTopUp(false)}
        onConfirm={() => {}}
        title=""
        confirmLabel=""
      >
        <TopUpForm
          onSuccess={handleTopUpSuccess}
          onCancel={() => setShowTopUp(false)}
        />
      </Modal>

      {/* Transfer modal */}
      <Modal
        isOpen={showTransfer}
        onClose={() => setShowTransfer(false)}
        onConfirm={() => {}}
        title=""
        confirmLabel=""
      >
        <TransferForm
          onSuccess={handleTransferSuccess}
          onCancel={() => setShowTransfer(false)}
        />
      </Modal>

      {/* Navbar */}
      <Navbar onLogout={() => setLogoutModal(true)} />

      {/* Greeting */}
      <div className="px-5 pb-4 font-nunito">
        <p className="text-xs font-bold text-[#9589c8]">{getGreeting()},</p>
        <h1 className="text-xl font-black text-[#3d2f8a]">{userName} 👋</h1>
      </div>

      {/* Low balance warning */}
      {lowBalance && (
        <div className="mx-4 mb-4 clay-warning bg-gradient-to-br from-[#fff0c0] to-[#ffe8a0] rounded-[18px] px-4 py-3 flex items-center gap-3 font-nunito">
          <span className="text-xl">⚠️</span>
          <span className="text-xs font-black text-[#92400e]">
            Saldo hampir habis. Minimal top-up Rp 10.000.
          </span>
        </div>
      )}

      {/* Balance card */}
      {walletLoading
        ? <div className="mx-4 mb-5"><Spinner /></div>
        : (
          <BalanceCard
            balance={balance}
            holderName={userName}
            onTopUp={() => setShowTopUp(true)}
            onTransfer={() => setShowTransfer(true)}
          />
        )
      }

      {/* Quick actions */}
      <div className="px-5 mb-2">
        <p className="text-sm font-black text-[#3d2f8a] mb-3">Aksi Cepat</p>
        <div className="grid grid-cols-4 gap-3">
          <QABtn
            label="Transfer"
            iconClass="bg-gradient-to-br from-[#d8d0ff] to-[#c4b5fd] clay-icon-purple"
            icon="↗"
            onClick={() => setShowTransfer(true)}
          />
          <QABtn
            label="Top-Up"
            iconClass="bg-gradient-to-br from-[#98f0cc] to-[#6ee7b7] clay-icon-teal"
            icon="⬆"
            onClick={() => setShowTopUp(true)}
          />
          <QABtn
            label="Riwayat"
            iconClass="bg-gradient-to-br from-[#c8e4ff] to-[#93c5fd] clay-icon-blue"
            icon="📋"
            onClick={() => setActiveTab('history')}
          />
          <QABtn
            label="Keluar"
            iconClass="bg-gradient-to-br from-[#ffd8d8] to-[#fca5a5] clay-icon-danger"
            icon="🚪"
            onClick={() => setLogoutModal(true)}
          />
        </div>
      </div>

      {/* Stats */}
      {transactions.length > 0 && (
        <>
          <div className="flex justify-between items-center px-5 mb-3 mt-5 font-nunito">
            <span className="text-sm font-black text-[#3d2f8a]">Bulan Ini</span>
          </div>
          <StatsRow transactions={transactions} />
        </>
      )}

      {/* Recent transactions */}
      <div className="flex justify-between items-center px-5 mb-3 mt-2 font-nunito">
        <span className="text-sm font-black text-[#3d2f8a]">Transaksi Terbaru</span>
        <button
          onClick={() => { refetchWallet(); fetchTransactions(1) }}
          className="text-[11px] font-black text-[#7c6af7] bg-transparent border-none cursor-pointer"
        >
          ↻ Refresh
        </button>
      </div>

      <TransactionList
        transactions={transactions}
        isLoading={txLoading}
        meta={meta}
        onLoadMore={loadMore}
      />

      {/* Bottom nav */}
      <div className="mx-4 mt-4 bg-white/80 rounded-full px-5 py-2.5 flex items-center justify-between clay-nav font-nunito">
        <NavItem icon="🏠" label="home"    active={activeTab} onChange={setActiveTab} />
        <NavItem icon="📋" label="history" active={activeTab} onChange={setActiveTab} />
        <div
          onClick={() => setShowTransfer(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7c6af7] to-[#5b3fdb] flex items-center justify-center text-white text-xl -mt-7 cursor-pointer clay-fab active:scale-95 transition-all duration-150"
        >
          ⚡
        </div>
        <NavItem icon="👤" label="profile" active={activeTab} onChange={setActiveTab} />
        <div
          onClick={() => setLogoutModal(true)}
          className="flex flex-col items-center gap-1 cursor-pointer opacity-35"
        >
          <span className="text-xl">🚪</span>
        </div>
      </div>

    </PageWrapper>
  )
}

function NavItem({ icon, label, active, onChange }) {
  const isActive = active === label
  return (
    <div
      onClick={() => onChange(label)}
      className="flex flex-col items-center gap-1 cursor-pointer"
    >
      <span className={`text-xl transition-opacity ${isActive ? 'opacity-100' : 'opacity-35'}`}>
        {icon}
      </span>
      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#7c6af7]" />}
    </div>
  )
}