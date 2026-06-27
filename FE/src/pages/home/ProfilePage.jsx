import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, ShieldCheck, ShieldOff, Calendar } from 'lucide-react'

import Sidebar from '../../components/layout/Sidebar'
import TotpSetupCard from '../../components/shared/TotpSetupCard'
import Toast from '../../components/ui/Toast'
import Modal from '../../components/ui/Modal'
import useAuthStore from '../../stores/authStore'

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-b-0" style={{ borderColor: 'var(--clay-border)' }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(91,63,219,0.08)' }}>
        <Icon size={16} color="var(--clay-primary)" strokeWidth={2.5} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: 'var(--clay-muted-lt)' }}>{label}</p>
        <p className="text-sm font-bold truncate" style={{ color: 'var(--clay-text)' }}>{value || '—'}</p>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const [logoutModal, setLogoutModal] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'
  const isSuspended = user?.is_suspended

  const handleLogout = async () => {
    setLogoutLoading(true)
    try { const { logout } = await import('../../api/authApi'); await logout() } catch {}
    navigate('/login')
    setLogoutLoading(false)
  }

  return (
    <div className="flex min-h-screen font-nunito" style={{ background: 'var(--clay-bg)' }}>
      <Toast />
      <Sidebar onLogout={() => setLogoutModal(true)} />

      <div className="flex-1 overflow-y-auto min-w-0 pb-20 md:pb-0">
        <div className="max-w-[640px] mx-auto px-4 md:px-6 py-5 md:py-8 flex flex-col gap-5">

          {/* Header */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer flex-shrink-0"
              style={{ background: 'var(--clay-surface)', boxShadow: 'var(--clay-shadow-sm)' }}
            >
              <ArrowLeft size={16} color="var(--clay-primary)" strokeWidth={2.5} />
            </button>
            <h1 className="text-xl md:text-2xl font-black" style={{ color: 'var(--clay-text)' }}>Profil</h1>
          </div>

          {/* Avatar + nama */}
          <div className="rounded-3xl p-6 flex flex-col items-center gap-3"
            style={{ background: 'var(--clay-surface)', boxShadow: 'var(--clay-shadow)' }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black text-white"
              style={{ background: 'linear-gradient(135deg, #f9a8d4, #f472b6)' }}>
              {initials}
            </div>
            <div className="text-center">
              <p className="text-lg font-black" style={{ color: 'var(--clay-text)' }}>{user?.name ?? 'Pengguna'}</p>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                {isSuspended
                  ? <><ShieldOff size={13} color="var(--clay-danger)" /><span className="text-[11px] font-bold" style={{ color: 'var(--clay-danger)' }}>Akun Disuspend</span></>
                  : <><ShieldCheck size={13} color="var(--clay-teal)" /><span className="text-[11px] font-bold" style={{ color: 'var(--clay-teal)' }}>Akun Aktif</span></>
                }
              </div>
            </div>
          </div>

          {/* Info akun */}
          <div className="rounded-3xl p-5" style={{ background: 'var(--clay-surface)', boxShadow: 'var(--clay-shadow)' }}>
            <p className="text-sm font-black mb-1" style={{ color: 'var(--clay-text)' }}>Informasi Akun</p>
            <InfoRow icon={Mail} label="Email" value={user?.email} />
            <InfoRow icon={Phone} label="No. HP" value={user?.phone} />
            <InfoRow icon={Calendar} label="Bergabung sejak" value={
              user?.created_at
                ? new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                : null
            } />
          </div>

          {/* 2FA */}
          <TotpSetupCard />

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