import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, ArrowRightLeft, Clock, User,
  LogOut, Shield, Wallet
} from 'lucide-react'
import useAuthStore from '../../stores/authStore'

// ── Nav Item (Desktop/Tablet sidebar) ──────────────────────────────────────
function SideNavItem({ icon: Icon, label, to, onClick }) {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-150 border-none cursor-pointer text-left"
        style={{ color: 'var(--clay-muted)', background: 'transparent' }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(91,63,219,0.08)'
          e.currentTarget.style.color = 'var(--clay-primary)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--clay-muted)'
        }}
      >
        <Icon size={18} strokeWidth={2.5} className="flex-shrink-0" />
        <span className="hidden lg:inline">{label}</span>
      </button>
    )
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-150 no-underline ${
          isActive ? 'text-white' : 'text-[var(--clay-muted)]'
        }`
      }
      style={({ isActive }) => isActive ? {
        background: 'linear-gradient(135deg, var(--clay-primary-lt), var(--clay-primary))',
        boxShadow: '4px 6px 16px rgba(91,63,219,0.35), inset 2px 2px 6px #a090ff, inset -2px -2px 6px #3a22b8',
      } : {}}
      onMouseEnter={e => {
        if (!e.currentTarget.style.background.includes('linear-gradient')) {
          e.currentTarget.style.background = 'rgba(91,63,219,0.08)'
          e.currentTarget.style.color = 'var(--clay-primary)'
        }
      }}
      onMouseLeave={e => {
        if (!e.currentTarget.style.background.includes('linear-gradient')) {
          e.currentTarget.style.background = ''
          e.currentTarget.style.color = ''
        }
      }}
    >
      <Icon size={18} strokeWidth={2.5} className="flex-shrink-0" />
      <span className="hidden lg:inline">{label}</span>
    </NavLink>
  )
}

// ── Nav Item (Mobile bottom bar) ───────────────────────────────────────────
function MobileNavItem({ icon: Icon, label, to, onClick }) {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="flex flex-col items-center justify-center gap-1 flex-1 py-2 border-none cursor-pointer bg-transparent"
        style={{ color: 'var(--clay-muted)' }}
      >
        <Icon size={20} strokeWidth={2.5} />
        <span className="text-[10px] font-bold">{label}</span>
      </button>
    )
  }

  return (
    <NavLink
      to={to}
      className="flex flex-col items-center justify-center gap-1 flex-1 py-2 no-underline"
    >
      {({ isActive }) => (
        <>
          <Icon size={20} strokeWidth={2.5} color={isActive ? 'var(--clay-primary)' : 'var(--clay-muted-lt)'} />
          <span className="text-[10px] font-bold" style={{ color: isActive ? 'var(--clay-primary)' : 'var(--clay-muted-lt)' }}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function Sidebar({ onLogout }) {
  const user = useAuthStore(s => s.user)
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'

  return (
    <>
      {/* ── Desktop / Tablet sidebar (hidden on mobile) ── */}
      <aside
        className="hidden md:flex flex-col h-screen sticky top-0 font-nunito md:w-[88px] lg:w-[240px] flex-shrink-0"
        style={{
          background: 'var(--clay-surface)',
          borderRight: '1px solid var(--clay-border)',
          boxShadow: '4px 0 24px rgba(160,148,220,0.10)',
          padding: '28px 16px',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2 mb-8 justify-center lg:justify-start">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--clay-primary-lt), var(--clay-primary))',
              boxShadow: '4px 5px 12px rgba(91,63,219,0.35), inset 2px 2px 6px #a090ff',
            }}
          >
            <Wallet size={18} color="white" strokeWidth={2.5} />
          </div>
          <span className="hidden lg:inline text-xl font-black" style={{ color: 'var(--clay-primary)', letterSpacing: '-0.5px' }}>
            Pay<span style={{ color: 'var(--clay-pink)' }}>Me</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1 items-center lg:items-stretch">
          <p className="hidden lg:block text-[10px] font-black tracking-widest uppercase px-4 mb-2" style={{ color: 'var(--clay-muted-lt)' }}>Menu</p>
          <SideNavItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" />
          <SideNavItem icon={ArrowRightLeft} label="Transfer" to="/transfer" />
          <SideNavItem icon={Clock} label="Riwayat" to="/history" />
          <SideNavItem icon={User} label="Profil" to="/profile" />

          {user?.role === 'admin' && (
            <>
              <p className="hidden lg:block text-[10px] font-black tracking-widest uppercase px-4 mt-5 mb-2" style={{ color: 'var(--clay-muted-lt)' }}>Admin</p>
              <SideNavItem icon={Shield} label="Admin Panel" to="/admin" />
            </>
          )}
        </nav>

        {/* User info + logout — disembunyikan label di tablet, full di desktop */}
        <div
          className="rounded-2xl p-3 mt-4"
          style={{ background: 'rgba(91,63,219,0.06)', border: '1px solid var(--clay-border)' }}
        >
          <div className="flex items-center gap-2.5 mb-3 justify-center lg:justify-start">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #f9a8d4, #f472b6)' }}
            >
              {initials}
            </div>
            <div className="min-w-0 hidden lg:block">
              <p className="text-sm font-black truncate" style={{ color: 'var(--clay-text)' }}>{user?.name ?? 'Pengguna'}</p>
              <p className="text-[10px] font-semibold truncate" style={{ color: 'var(--clay-muted-lt)' }}>{user?.email ?? ''}</p>
            </div>
          </div>
          <SideNavItem icon={LogOut} label="Keluar" onClick={onLogout} />
        </div>
      </aside>

      {/* ── Mobile bottom nav (hidden on tablet/desktop) ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 flex items-stretch z-50 font-nunito"
        style={{
          background: 'var(--clay-surface)',
          borderTop: '1px solid var(--clay-border)',
          boxShadow: '0 -4px 20px rgba(160,148,220,0.15)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <MobileNavItem icon={LayoutDashboard} label="Home" to="/dashboard" />
        <MobileNavItem icon={ArrowRightLeft} label="Transfer" to="/transfer" />
        <MobileNavItem icon={Clock} label="Riwayat" to="/history" />
        <MobileNavItem icon={User} label="Profil" to="/profile" />
        {user?.role === 'admin' && (
          <MobileNavItem icon={Shield} label="Admin" to="/admin" />
        )}
        <MobileNavItem icon={LogOut} label="Keluar" onClick={onLogout} />
      </nav>
    </>
  )
}