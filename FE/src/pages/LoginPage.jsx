import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import useToastStore from '../stores/toastStore'
import Toast from '../components/ui/Toast'
import Button from '../components/ui/Button'

export default function LoginPage() {
  const navigate     = useNavigate()
  const { login }    = useAuth()
  const { addToast } = useToastStore()

  const [form, setForm]           = useState({ email: '', password: '' })
  const [errors, setErrors]       = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPass, setShowPass]   = useState(false)

  // Step 2 — TOTP
  const [step, setStep]               = useState(1)
  const [totpCode, setTotpCode]       = useState('')
  const [totpError, setTotpError]     = useState('')
  const [totpLoading, setTotpLoading] = useState(false)

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrors(er => ({ ...er, [e.target.name]: null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})
    try {
      const res = await login(form.email, form.password)
      if (res?.data?.data?.requires_2fa) {
        setStep(2)
        return
      }
      addToast('Login berhasil!', 'success')
      navigate('/dashboard')
    } catch (err) {
      const data = err?.response?.data
      if (err?.response?.status === 422) {
        setErrors(data?.errors ?? {})
      } else {
        addToast(data?.message ?? 'Login gagal, coba lagi.', 'error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2 — kirim ulang ke /api/login, sekarang membawa totp_code.
  // Sesi baru benar-benar dibuat di titik ini (lihat AuthService::login()) —
  // bukan request ke endpoint terpisah.
  const handleVerifyTotp = async () => {
    if (totpCode.length !== 6) { setTotpError('Kode harus 6 digit.'); return }
    setTotpLoading(true)
    setTotpError('')
    try {
      await login(form.email, form.password, totpCode)
      addToast('Login berhasil!', 'success')
      navigate('/dashboard')
    } catch (err) {
      setTotpError(err?.response?.data?.message ?? 'Kode tidak valid.')
    } finally {
      setTotpLoading(false)
    }
  }

  const isDisabled = !form.email || !form.password || isLoading

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#f0eeff', fontFamily: 'Nunito, sans-serif' }}
    >
      <Toast />

      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div style={{
            width: 72, height: 72, borderRadius: 24,
            background: 'linear-gradient(135deg, #7c5ff5, #5b3fdb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
            boxShadow: '10px 12px 28px rgba(91,63,219,0.38),-6px -6px 16px #ffffff,inset 5px 5px 14px #a090ff,inset -5px -5px 14px #3a22b8',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L6 8h4v6H8l4 8 4-8h-2V8h4L12 2z" fill="white" />
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#1a1060', margin: 0 }}>PayMe</h1>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#9888c8', marginTop: 4 }}>Masuk ke akun kamu</p>
        </div>

        {/* Card */}
        <div style={{
          background: '#ffffff', borderRadius: 28, padding: 24,
          boxShadow: '12px 14px 36px rgba(120,100,200,0.22),-8px -8px 20px #ffffff,inset 6px 6px 18px rgba(255,255,255,0.98),inset -6px -6px 18px rgba(160,140,220,0.20)',
        }}>

          {/* ── Step 2: TOTP ──────────────────────────────────────────── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#6b5b9e', marginBottom: 4 }}>
                  Autentikasi Dua Faktor
                </p>
                <p style={{ fontSize: 12, color: '#9888c8' }}>
                  Masukkan kode 6 digit dari aplikasi autentikator kamu.
                </p>
              </div>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={totpCode}
                onChange={(e) => {
                  setTotpCode(e.target.value.replace(/\D/g, ''))
                  setTotpError('')
                }}
                placeholder="______"
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: 16,
                  border: 'none', outline: 'none', fontSize: 28, fontWeight: 900,
                  fontFamily: 'Nunito, sans-serif', color: '#1a1060',
                  textAlign: 'center', letterSpacing: 14,
                  background: 'rgba(240,238,255,0.7)', boxSizing: 'border-box',
                  boxShadow: totpError
                    ? '6px 8px 20px rgba(220,60,60,0.20),-3px -3px 10px #ffffff,inset 3px 3px 8px rgba(255,255,255,0.95),inset -3px -3px 8px rgba(220,60,60,0.22)'
                    : '6px 8px 20px rgba(100,80,180,0.18),-3px -3px 10px #ffffff,inset 3px 3px 8px rgba(255,255,255,0.95),inset -3px -3px 8px rgba(140,120,200,0.20)',
                }}
              />

              {totpError && (
                <p style={{ fontSize: 10, fontWeight: 800, color: '#e03030', textAlign: 'center' }}>
                  {totpError}
                </p>
              )}

              <Button
                onClick={handleVerifyTotp}
                disabled={totpCode.length !== 6 || totpLoading}
                isLoading={totpLoading}
                variant="primary"
                className="w-full"
                style={{ width: '100%' }}
              >
                Verifikasi
              </Button>

              <button
                type="button"
                onClick={() => { setStep(1); setTotpCode(''); setTotpError('') }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#9888c8', fontWeight: 700 }}
              >
                ← Kembali ke login
              </button>
            </div>
          )}

          {/* ── Step 1: Credentials ───────────────────────────────────── */}
          {step === 1 && (
            <>
              {/* Email */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#6b5b9e', marginBottom: 6, paddingLeft: 4 }}>
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="budi@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 16,
                    border: 'none', outline: 'none', fontSize: 14, fontWeight: 600,
                    fontFamily: 'Nunito, sans-serif', color: '#1a1060',
                    background: 'rgba(240,238,255,0.7)', boxSizing: 'border-box',
                    boxShadow: errors.email
                      ? '6px 8px 20px rgba(220,60,60,0.20),-3px -3px 10px #ffffff,inset 3px 3px 8px rgba(255,255,255,0.95),inset -3px -3px 8px rgba(220,60,60,0.22)'
                      : '6px 8px 20px rgba(100,80,180,0.18),-3px -3px 10px #ffffff,inset 3px 3px 8px rgba(255,255,255,0.95),inset -3px -3px 8px rgba(140,120,200,0.20)',
                  }}
                />
                {errors.email?.[0] && (
                  <p style={{ fontSize: 10, fontWeight: 800, color: '#e03030', marginTop: 4, paddingLeft: 4 }}>
                    {errors.email[0]}
                  </p>
                )}
              </div>

              {/* Password */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#6b5b9e', marginBottom: 6, paddingLeft: 4 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    style={{
                      width: '100%', padding: '12px 44px 12px 16px', borderRadius: 16,
                      border: 'none', outline: 'none', fontSize: 14, fontWeight: 600,
                      fontFamily: 'Nunito, sans-serif', color: '#1a1060',
                      background: 'rgba(240,238,255,0.7)', boxSizing: 'border-box',
                      boxShadow: errors.password
                        ? '6px 8px 20px rgba(220,60,60,0.20),-3px -3px 10px #ffffff,inset 3px 3px 8px rgba(255,255,255,0.95),inset -3px -3px 8px rgba(220,60,60,0.22)'
                        : '6px 8px 20px rgba(100,80,180,0.18),-3px -3px 10px #ffffff,inset 3px 3px 8px rgba(255,255,255,0.95),inset -3px -3px 8px rgba(140,120,200,0.20)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1,
                    }}
                  >
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
                {errors.password?.[0] && (
                  <p style={{ fontSize: 10, fontWeight: 800, color: '#e03030', marginTop: 4, paddingLeft: 4 }}>
                    {errors.password[0]}
                  </p>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isDisabled}
                isLoading={isLoading}
                variant="primary"
                className="w-full"
                style={{ width: '100%' }}
              >
                Masuk
              </Button>

              <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#9888c8', marginTop: 20, marginBottom: 0 }}>
                Belum punya akun?{' '}
                <Link to="/register" style={{ color: '#5b3fdb', fontWeight: 900, textDecoration: 'none' }}>
                  Daftar sekarang
                </Link>
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  )
}