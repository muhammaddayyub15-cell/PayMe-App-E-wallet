import { useState } from 'react'
import { ShieldCheck, ShieldAlert, Lock } from 'lucide-react'
import useAuthStore from '../../stores/authStore'

// ── KONFIGURASI ──────────────────────────────────────────────────────────────
// Set ke `true` setelah backend punya route 2FA terdaftar (cek dengan
// `php artisan route:list` — harus ada endpoint setup/confirm/disable).
// Selama false, card ini tampil sebagai "coming soon" yang jujur,
// bukan tombol yang memanggil endpoint kosong (404).
const TWO_FA_BACKEND_READY = true

export default function TotpSetupCard() {
  const user = useAuthStore(s => s.user)
  const has2FA = Boolean(user?.two_factor_confirmed_at)

  const [step, setStep] = useState('idle') // idle | qr | confirm
  const [qrData, setQrData] = useState(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // ── Placeholder handlers — diisi setelah backend siap ──────────────────
  const handleStartSetup = async () => {
    setIsLoading(true)
    setError('')
    try {
      const { setupTotp } = await import('../../api/twoFactorApi')
      const res = await setupTotp()
      setQrData(res.data.data) // { qr_code_svg / qr_code_url, secret }
      setStep('qr')
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Gagal memulai setup 2FA.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = async () => {
    setIsLoading(true)
    setError('')
    try {
      const { confirmTotp } = await import('../../api/twoFactorApi')
      await confirmTotp(code)
      window.location.reload() // refresh authStore.user agar two_factor_confirmed_at terupdate
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Kode tidak valid.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Coming soon state ────────────────────────────────────────────────────
  if (!TWO_FA_BACKEND_READY) {
    return (
      <div className="rounded-3xl p-5 flex flex-col gap-3"
        style={{ background: 'var(--clay-surface)', boxShadow: 'var(--clay-shadow)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(91,63,219,0.08)' }}>
            <Lock size={18} color="var(--clay-muted-lt)" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-black" style={{ color: 'var(--clay-text)' }}>Two-Factor Authentication</p>
            <p className="text-[11px] font-semibold" style={{ color: 'var(--clay-muted-lt)' }}>Segera hadir</p>
          </div>
        </div>
        <p className="text-xs font-semibold" style={{ color: 'var(--clay-muted)' }}>
          Fitur keamanan tambahan ini sedang dikembangkan. Kamu akan diberi tahu saat sudah tersedia.
        </p>
      </div>
    )
  }

  // ── Already enabled ──────────────────────────────────────────────────────
  if (has2FA) {
    return (
      <div className="rounded-3xl p-5 flex flex-col gap-3"
        style={{ background: 'var(--clay-surface)', boxShadow: 'var(--clay-shadow)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(48,184,128,0.12)' }}>
            <ShieldCheck size={18} color="var(--clay-teal)" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-black" style={{ color: 'var(--clay-text)' }}>2FA Aktif</p>
            <p className="text-[11px] font-semibold" style={{ color: 'var(--clay-muted-lt)' }}>Akun kamu sudah dilindungi Google Authenticator</p>
          </div>
        </div>

        {/* Form disable */}
        {step === 'disabling'
          ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold" style={{ color: 'var(--clay-muted)' }}>
                Masukkan password untuk menonaktifkan 2FA.
              </p>
              <input
                type="password"
                placeholder="Password kamu"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full rounded-2xl py-2.5 px-4 text-sm font-bold border-none outline-none"
                style={{ background: 'rgba(91,63,219,0.06)', color: 'var(--clay-text)' }}
              />
              {error && <p className="text-xs font-bold" style={{ color: 'var(--clay-danger)' }}>{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => { setStep('idle'); setCode(''); setError('') }}
                  className="flex-1 px-4 py-2.5 rounded-2xl text-xs font-bold border-none cursor-pointer"
                  style={{ background: 'rgba(91,63,219,0.08)', color: 'var(--clay-primary)' }}
                >
                  Batal
                </button>
                <button
                  onClick={async () => {
                    setIsLoading(true); setError('')
                    try {
                      const { disableTotp } = await import('../../api/twoFactorApi')
                      await disableTotp(code)
                      window.location.reload()
                    } catch (err) {
                      setError(err?.response?.data?.message ?? 'Gagal menonaktifkan 2FA.')
                    } finally { setIsLoading(false) }
                  }}
                  disabled={isLoading || !code}
                  className="flex-1 px-4 py-2.5 rounded-2xl text-xs font-bold border-none cursor-pointer disabled:opacity-60"
                  style={{ background: 'var(--clay-danger)', color: 'white' }}
                >
                  {isLoading ? 'Memproses...' : 'Nonaktifkan'}
                </button>
              </div>
            </div>
          )
          : (
            <button
              onClick={() => setStep('disabling')}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold border-none cursor-pointer self-start"
              style={{ background: 'rgba(220,50,50,0.08)', color: 'var(--clay-danger)' }}
            >
              Nonaktifkan 2FA
            </button>
          )
        }
      </div>
    )
  }

  // ── Idle — belum setup ───────────────────────────────────────────────────
  if (step === 'idle') {
    return (
      <div className="rounded-3xl p-5 flex flex-col gap-3"
        style={{ background: 'var(--clay-surface)', boxShadow: 'var(--clay-shadow)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(240,184,0,0.12)' }}>
            <ShieldAlert size={18} color="#a07800" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-black" style={{ color: 'var(--clay-text)' }}>Two-Factor Authentication</p>
            <p className="text-[11px] font-semibold" style={{ color: 'var(--clay-muted-lt)' }}>Belum aktif</p>
          </div>
        </div>
        <p className="text-xs font-semibold" style={{ color: 'var(--clay-muted)' }}>
          Tambahkan lapisan keamanan ekstra menggunakan Google Authenticator atau aplikasi serupa.
        </p>
        {error && <p className="text-xs font-bold" style={{ color: 'var(--clay-danger)' }}>{error}</p>}
        <button
          onClick={handleStartSetup}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-2xl text-xs font-bold border-none cursor-pointer self-start disabled:opacity-60"
          style={{ background: 'var(--clay-primary)', color: 'white' }}
        >
          {isLoading ? 'Memuat...' : 'Aktifkan 2FA'}
        </button>
      </div>
    )
  }

  // ── QR step ──────────────────────────────────────────────────────────────
  if (step === 'qr') {
    return (
      <div className="rounded-3xl p-5 flex flex-col gap-4"
        style={{ background: 'var(--clay-surface)', boxShadow: 'var(--clay-shadow)' }}>
        <p className="text-sm font-black" style={{ color: 'var(--clay-text)' }}>Scan QR Code</p>
        <p className="text-xs font-semibold" style={{ color: 'var(--clay-muted)' }}>
          Buka Google Authenticator, scan kode di bawah, lalu masukkan 6 digit kode yang muncul.
        </p>

        <div className="flex justify-center p-3 rounded-2xl" style={{ background: 'rgba(91,63,219,0.06)' }}>
          {qrData?.qr_code_svg
            ? <div dangerouslySetInnerHTML={{ __html: qrData.qr_code_svg }} />
            : <p className="text-xs font-semibold" style={{ color: 'var(--clay-muted-lt)' }}>QR tidak tersedia</p>
          }
        </div>

        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="000000"
          className="w-full text-center text-lg font-black tracking-[0.3em] rounded-2xl py-3 border-none outline-none"
          style={{ background: 'rgba(91,63,219,0.06)', color: 'var(--clay-text)' }}
        />

        {error && <p className="text-xs font-bold" style={{ color: 'var(--clay-danger)' }}>{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={() => setStep('idle')}
            className="flex-1 px-4 py-2.5 rounded-2xl text-xs font-bold border-none cursor-pointer"
            style={{ background: 'rgba(91,63,219,0.08)', color: 'var(--clay-primary)' }}
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || code.length !== 6}
            className="flex-1 px-4 py-2.5 rounded-2xl text-xs font-bold border-none cursor-pointer disabled:opacity-60"
            style={{ background: 'var(--clay-primary)', color: 'white' }}
          >
            {isLoading ? 'Memverifikasi...' : 'Konfirmasi'}
          </button>
        </div>
      </div>
    )
  }

  return null
}