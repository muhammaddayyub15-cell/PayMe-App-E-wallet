import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, Bell, ShieldCheck, ShieldOff } from 'lucide-react'

import useWallet from '../../hooks/useWallet'
import useTransactions from '../../hooks/useTransactions'
import useAuthStore from '../../stores/authStore'

import Sidebar from '../../components/layout/Sidebar'
import BalanceCard from '../../components/shared/BalanceCard'
import TransactionList from '../../components/shared/TransactionList'
import TopUpForm from '../../components/shared/TopUpForm'
import TransferForm from '../../components/shared/TransferForm'
import SpendingChart from '../../components/shared/SpendingChart'
import DonutChart from '../../components/shared/DonutChart'
import QuickTransferBar from '../../components/shared/QuickTransferBar'
import InsightCards from '../../components/shared/InsightCards'
import ActivityHeatmap from '../../components/shared/ActivityHeatmap'
import QrProfileCard from '../../components/shared/QrProfileCard'
import TodayTimeline from '../../components/shared/TodayTimeline'
import TopReceivers from '../../components/shared/TopReceivers'
import Modal from '../../components/ui/Modal'
import Toast from '../../components/ui/Toast'
import Spinner from '../../components/ui/Spinner'
import { formatRupiahShort } from '../../utils/formatCurrency'

// ── Clay Mascot (dari LandingPage) ───────────────────────────────────────────
function ClayMascot() {
  return (
    <svg viewBox="0 0 320 360" width="120" height="135" xmlns="http://www.w3.org/2000/svg" className="w-16 h-[72px] md:w-20 md:h-[90px] lg:w-[120px] lg:h-[135px] flex-shrink-0">
      <defs>
        <radialGradient id="dbodyGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#c8b8ff" />
          <stop offset="100%" stopColor="#7050e8" />
        </radialGradient>
        <radialGradient id="dfaceGrad" cx="40%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#fff0f8" />
          <stop offset="100%" stopColor="#f0d8ff" />
        </radialGradient>
        <radialGradient id="dcoinGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#fff0a0" />
          <stop offset="100%" stopColor="#e0a800" />
        </radialGradient>
        <radialGradient id="dcheekGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb8d0" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffb8d0" stopOpacity="0" />
        </radialGradient>
        <filter id="dsoftBlur"><feGaussianBlur stdDeviation="2" /></filter>
        <filter id="dclayShadow"><feDropShadow dx="4" dy="6" stdDeviation="8" floodColor="#4020a0" floodOpacity="0.28" /></filter>
      </defs>
      <ellipse cx="160" cy="340" rx="80" ry="14" fill="#b0a0e0" opacity="0.28" filter="url(#dsoftBlur)" />
      <ellipse cx="160" cy="240" rx="88" ry="96" fill="url(#dbodyGrad)" filter="url(#dclayShadow)" />
      <ellipse cx="130" cy="190" rx="28" ry="18" fill="white" opacity="0.22" transform="rotate(-20,130,190)" />
      <ellipse cx="76" cy="250" rx="22" ry="38" fill="url(#dbodyGrad)" transform="rotate(-18,76,250)" />
      <ellipse cx="244" cy="238" rx="22" ry="36" fill="url(#dbodyGrad)" transform="rotate(20,244,238)" />
      <circle cx="258" cy="198" r="26" fill="url(#dcoinGrad)" filter="url(#dclayShadow)" />
      <text x="258" y="203" textAnchor="middle" fontFamily="Nunito,sans-serif" fontWeight="900" fontSize="18" fill="#a07800">Rp</text>
      <ellipse cx="133" cy="328" rx="30" ry="18" fill="#6840d8" />
      <ellipse cx="187" cy="328" rx="30" ry="18" fill="#6840d8" />
      <circle cx="160" cy="138" r="74" fill="url(#dfaceGrad)" filter="url(#dclayShadow)" />
      <circle cx="90" cy="138" r="18" fill="url(#dfaceGrad)" />
      <circle cx="230" cy="138" r="18" fill="url(#dfaceGrad)" />
      <ellipse cx="137" cy="130" rx="16" ry="18" fill="white" />
      <circle cx="139" cy="132" r="10" fill="#1a0860" />
      <circle cx="143" cy="128" r="4" fill="white" />
      <ellipse cx="183" cy="130" rx="16" ry="18" fill="white" />
      <circle cx="181" cy="132" r="10" fill="#1a0860" />
      <circle cx="185" cy="128" r="4" fill="white" />
      <circle cx="108" cy="158" r="20" fill="url(#dcheekGrad)" filter="url(#dsoftBlur)" />
      <circle cx="212" cy="158" r="20" fill="url(#dcheekGrad)" filter="url(#dsoftBlur)" />
      <path d="M 138 162 Q 160 184 182 162" stroke="#c060a0" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  )
}

// ── Greeting ──────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours()
  if (h < 11) return 'Selamat pagi'
  if (h < 15) return 'Selamat siang'
  if (h < 18) return 'Selamat sore'
  return 'Selamat malam'
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }) {
  return (
    <div className="rounded-3xl p-3 md:p-4 font-nunito flex flex-col gap-1 min-w-0"
      style={{ background: 'var(--clay-surface)', boxShadow: 'var(--clay-shadow-sm)' }}>
      <p className="text-[9px] md:text-[10px] font-black tracking-widest uppercase truncate" style={{ color: 'var(--clay-muted-lt)' }}>{label}</p>
      <p className="text-base md:text-lg font-black truncate" style={{ color: 'var(--clay-text)' }}>{value}</p>
      <p className="text-[9px] md:text-[10px] font-bold truncate" style={{ color }}>{sub}</p>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const clearAuth = useAuthStore(s => s.clear)

  const { balance, isLoading: walletLoading, refetch: refetchWallet } = useWallet()
  const { transactions, meta, isLoading: txLoading, fetchTransactions, loadMore } = useTransactions()

  const [showNotif, setShowNotif] = useState(false)
  const [showTopUp, setShowTopUp] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [transferTarget, setTransferTarget] = useState('')
  const [logoutModal, setLogoutModal] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)

  useEffect(() => { fetchTransactions(1) }, [fetchTransactions])

  const handleLogout = async () => {
    setLogoutLoading(true)
    try { const { logout } = await import('../../api/authApi'); await logout() } catch { }
    clearAuth(); navigate('/login'); setLogoutLoading(false)
  }

  const handleTopUpSuccess = () => { setShowTopUp(false); refetchWallet(); fetchTransactions(1) }
  const handleTransferSuccess = () => { setShowTransfer(false); refetchWallet(); fetchTransactions(1) }
  const handleQuickTransfer = (name) => { setTransferTarget(name); setShowTransfer(true) }

  // Stats bulan ini
  const now = new Date()
  const thisMonth = transactions.filter(tx => {
    const d = new Date(tx.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const totalIn = thisMonth.filter(t => t.type === 'TRANSFER_IN' || t.type === 'TOPUP').reduce((s, t) => s + t.amount, 0)
  const totalOut = thisMonth.filter(t => t.type === 'TRANSFER_OUT').reduce((s, t) => s + t.amount, 0)
  const totalCount = thisMonth.length

  const isSuspended = user?.is_suspended
  const has2FA = user?.two_factor_confirmed_at
  const isEmptyBalance = balance === 0
  const lowBalance = balance !== null && balance > 0 && balance < 10000

  return (
    <div className="flex min-h-screen font-nunito" style={{ background: 'var(--clay-bg)' }}>
      <Toast />

      {/* Sidebar (desktop/tablet) + Bottom nav (mobile) — lihat Sidebar.jsx */}
      <Sidebar onLogout={() => setLogoutModal(true)} />

      {/* Main content — padding bawah ekstra di mobile supaya tidak ketutup bottom nav */}
      <div className="flex-1 overflow-y-auto min-w-0 pb-20 md:pb-0">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-5 md:py-6">

          {/* ── Top bar ── */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
              <ClayMascot />
              <div className="min-w-0">
                <p className="text-xs font-bold" style={{ color: 'var(--clay-muted-lt)' }}>{getGreeting()},</p>
                <h1 className="text-lg md:text-2xl font-black truncate" style={{ color: 'var(--clay-text)' }}>{user?.name ?? 'Pengguna'} 👋</h1>
                {/* Account status badge */}
                <div className="flex items-center gap-1.5 mt-1">
                  {isSuspended
                    ? <><ShieldOff size={13} color="var(--clay-danger)" /><span className="text-[11px] font-bold" style={{ color: 'var(--clay-danger)' }}>Akun Disuspend</span></>
                    : <><ShieldCheck size={13} color="var(--clay-teal)" /><span className="text-[11px] font-bold" style={{ color: 'var(--clay-teal)' }}>Akun Aktif</span></>
                  }
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              {/* 2FA banner — disembunyikan di mobile, badge kecil saja */}
              {!has2FA && (
                <div className="hidden sm:flex items-center gap-2 px-3 md:px-4 py-2 rounded-full text-[11px] md:text-xs font-bold whitespace-nowrap"
                  style={{ background: 'rgba(240,184,0,0.12)', color: '#a07800', border: '1px solid rgba(240,184,0,0.3)' }}>
                  ⚠️ Aktifkan 2FA untuk keamanan akun
                </div>
              )}
              <button
                onClick={() => { refetchWallet(); fetchTransactions(1) }}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center border-none cursor-pointer transition-transform hover:rotate-180 duration-300 flex-shrink-0"
                style={{ background: 'var(--clay-surface)', boxShadow: 'var(--clay-shadow-sm)' }}
              >
                <RefreshCw size={16} color="var(--clay-primary)" strokeWidth={2.5} />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowNotif(v => !v)}
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center border-none cursor-pointer relative flex-shrink-0"
                  style={{ background: 'var(--clay-surface)', boxShadow: 'var(--clay-shadow-sm)' }}
                >
                  <Bell size={16} color="var(--clay-primary)" strokeWidth={2.5} />
                  {totalCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: 'var(--clay-pink)' }} />
                  )}
                </button>

                {showNotif && (
                  <div className="absolute right-0 top-12 w-72 rounded-3xl p-4 z-50 flex flex-col gap-2"
                    style={{ background: 'var(--clay-surface)', boxShadow: 'var(--clay-shadow)' }}>
                    <p className="text-xs font-black" style={{ color: 'var(--clay-text)' }}>Transaksi Hari Ini</p>
                    {transactions
                      .filter(tx => new Date(tx.created_at).toDateString() === new Date().toDateString())
                      .slice(0, 5)
                      .map(tx => (
                        <div key={tx.id} className="flex items-center gap-2 px-3 py-2 rounded-2xl"
                          style={{ background: 'rgba(91,63,219,0.05)' }}>
                          <span className="text-sm">{tx.type === 'TOPUP' ? '⬆' : tx.type === 'TRANSFER_IN' ? '↙' : '↗'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black truncate" style={{ color: 'var(--clay-text)' }}>
                              {tx.counterparty ?? 'Top-Up Saldo'}
                            </p>
                            <p className="text-[10px]" style={{ color: 'var(--clay-muted-lt)' }}>
                              {new Date(tx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <p className="text-[11px] font-black" style={{ color: tx.type === 'TRANSFER_OUT' ? 'var(--clay-danger)' : 'var(--clay-teal)' }}>
                            {tx.type === 'TRANSFER_OUT' ? '-' : '+'}{Math.round(tx.amount / 1000)}rb
                          </p>
                        </div>
                      ))}
                    {!transactions.filter(tx => new Date(tx.created_at).toDateString() === new Date().toDateString()).length && (
                      <p className="text-xs font-semibold text-center py-2" style={{ color: 'var(--clay-muted-lt)' }}>Belum ada transaksi hari ini</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── 2FA banner versi mobile (full width, di bawah top bar) ── */}
          {!has2FA && (
            <div className="sm:hidden mb-4 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[11px] font-bold"
              style={{ background: 'rgba(240,184,0,0.12)', color: '#a07800', border: '1px solid rgba(240,184,0,0.3)' }}>
              ⚠️ Aktifkan 2FA untuk keamanan akun
            </div>
          )}

          {/* ── Alerts ── */}
          {isEmptyBalance && (
            <div className="mb-4 rounded-2xl px-4 py-3 flex items-center gap-3 text-xs font-bold"
              style={{ background: 'rgba(240,184,0,0.12)', color: '#92400e', border: '1px solid rgba(240,184,0,0.25)' }}>
              💰 Saldo kosong — top up sekarang untuk mulai bertransaksi
            </div>
          )}
          {lowBalance && (
            <div className="mb-4 rounded-2xl px-4 py-3 flex items-center gap-3 text-xs font-bold"
              style={{ background: 'rgba(240,184,0,0.12)', color: '#92400e', border: '1px solid rgba(240,184,0,0.25)' }}>
              ⚠️ Saldo hampir habis — top up minimal Rp 10.000
            </div>
          )}

          {/* ── Grid Layout ──
               Mobile  (<768px) : 1 kolom, semua section stack vertikal
               Tablet  (768–1023px) : 2 kolom
               Desktop (≥1024px) : 3 kolom (2fr 2fr fixed-right, via lg:grid-cols-[1fr_1fr_340px]) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_340px] gap-4 md:gap-5">

            {/* COL 1 */}
            <div className="flex flex-col gap-4 md:gap-5">

              {/* Balance Card */}
              {walletLoading
                ? <div className="rounded-3xl p-6" style={{ background: 'var(--clay-surface)', boxShadow: 'var(--clay-shadow)' }}><Spinner /></div>
                : <BalanceCard balance={balance} holderName={user?.name ?? ''} onTopUp={() => setShowTopUp(true)} onTransfer={() => setShowTransfer(true)} />
              }

              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                <StatCard label="Masuk" value={formatRupiahShort(totalIn)} sub={`${thisMonth.filter(t => t.type === 'TRANSFER_IN' || t.type === 'TOPUP').length} transaksi`} color="var(--clay-teal)" />
                <StatCard label="Keluar" value={formatRupiahShort(totalOut)} sub="Transfer out" color="var(--clay-danger)" />
                <StatCard label="Total" value={totalCount} sub="Transaksi bulan ini" color="var(--clay-primary)" />
              </div>

              {/* Quick transfer */}
              <QuickTransferBar transactions={transactions} onTransfer={handleQuickTransfer} />

              {/* Spending chart */}
              <SpendingChart transactions={transactions} />

              {/* Top receivers */}
              <TopReceivers transactions={transactions} onTransfer={handleQuickTransfer} />

            </div>

            {/* COL 2 */}
            <div className="flex flex-col gap-4 md:gap-5">

              {/* Insight cards */}
              <InsightCards transactions={transactions} balance={balance} />

              {/* Donut chart */}
              <DonutChart transactions={transactions} />

              {/* Activity heatmap */}
              <ActivityHeatmap transactions={transactions} />

              {/* Today timeline */}
              <TodayTimeline transactions={transactions} />

            </div>

            {/* COL 3 — Right panel (full width di mobile/tablet, sidebar kanan di desktop) */}
            <div className="flex flex-col gap-4 md:gap-5 md:col-span-2 lg:col-span-1">

              {/* QR Profile */}
              <QrProfileCard />

              {/* Recent transactions */}
              <div className="rounded-3xl p-4 md:p-5 flex flex-col gap-3"
                style={{ background: 'var(--clay-surface)', boxShadow: 'var(--clay-shadow)' }}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black" style={{ color: 'var(--clay-text)' }}>Transaksi Terbaru</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(91,63,219,0.1)', color: 'var(--clay-primary)' }}>
                    {meta?.total ?? 0} total
                  </span>
                </div>
                <TransactionList
                  transactions={transactions}
                  isLoading={txLoading}
                  meta={meta}
                  onLoadMore={loadMore}
                />
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <Modal isOpen={logoutModal} onClose={() => setLogoutModal(false)} onConfirm={handleLogout}
        title="Keluar dari PayMe?" confirmLabel="Ya, Keluar" isLoading={logoutLoading}>
        <p className="text-sm font-semibold" style={{ color: 'var(--clay-primary)' }}>
          Sesi kamu akan diakhiri. Kamu perlu login kembali untuk mengakses saldo.
        </p>
      </Modal>

      <Modal isOpen={showTopUp} onClose={() => setShowTopUp(false)} onConfirm={() => { }} title="" confirmLabel="">
        <TopUpForm onSuccess={handleTopUpSuccess} onCancel={() => setShowTopUp(false)} />
      </Modal>

      <Modal isOpen={showTransfer} onClose={() => setShowTransfer(false)} onConfirm={() => { }} title="" confirmLabel="">
        <TransferForm onSuccess={handleTransferSuccess} onCancel={() => setShowTransfer(false)} defaultReceiver={transferTarget} />
      </Modal>

    </div>
  )
}