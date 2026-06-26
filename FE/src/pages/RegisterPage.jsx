// src/pages/RegisterPage.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useToastStore from '../stores/toastStore'
import { validateEmail, validatePhone, validatePassword } from '../utils/validators'
import { register } from '../api/authApi'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Toast from '../components/ui/Toast'

export default function RegisterPage() {
  const navigate     = useNavigate()
  const { addToast } = useToastStore()

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', password_confirmation: '',
  })
  const [errors, setErrors]     = useState({})
  const [isLoading, setIsLoading] = useState(false)

 const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))

    // Real-time validation per field
    let err = null
    if (name === 'email')    err = validateEmail(value)
    if (name === 'phone')    err = validatePhone(value)
    if (name === 'password') err = validatePassword(value)
    if (name === 'password_confirmation' && value !== form.password)
      err = 'Password tidak cocok.'

    setErrors(er => ({ ...er, [name]: err ? [err] : null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})
    try {
      await register(form)
      addToast('Registrasi berhasil! Silakan login.', 'success')
      navigate('/login')
    } catch (err) {
      const data = err?.response?.data
      if (err?.response?.status === 422) {
        setErrors(data?.errors ?? {})
      } else {
        addToast(data?.message ?? 'Registrasi gagal, coba lagi.', 'error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const isDisabled = !form.name || !form.email || !form.phone
    || !form.password || !form.password_confirmation || isLoading

  return (
   <div className="min-h-screen flex items-center justify-center p-4 font-nunito" style={{ background: '#f0eeff' }}>
      <Toast />

      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
         <div style={{
            width: 72, height: 72,
            borderRadius: 24,
            background: 'linear-gradient(135deg, #7c5ff5, #5b3fdb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
            boxShadow: '10px 12px 28px rgba(91,63,219,0.38),-6px -6px 16px #ffffff,inset 5px 5px 14px #a090ff,inset -5px -5px 14px #3a22b8',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L6 8h4v6H8l4 8 4-8h-2V8h4L12 2z" fill="white" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-[#3d2f8a]">Buat Akun</h1>
          <p className="text-sm font-semibold text-[#9589c8] mt-1">Daftar dan mulai pakai PayMe</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-6" style={{
          background: '#ffffff',
          boxShadow: '12px 14px 36px rgba(160,148,220,0.26),-8px -8px 20px #ffffff,inset 6px 6px 18px rgba(255,255,255,0.98),inset -6px -6px 18px rgba(160,140,220,0.26)'
        }}>

          <div className="flex flex-col gap-4">
            <Input
              label="Nama Lengkap"
              name="name"
              type="text"
              placeholder="Budi Santoso"
              value={form.name}
              onChange={handleChange}
              error={errors.name?.[0]}
              autoComplete="name"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="budi@example.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email?.[0]}
              autoComplete="email"
            />
            <Input
              label="No. HP"
              name="phone"
              type="tel"
              placeholder="08123456789"
              value={form.phone}
              onChange={handleChange}
              error={errors.phone?.[0]}
              autoComplete="tel"
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Min. 8 karakter"
              value={form.password}
              onChange={handleChange}
              error={errors.password?.[0]}
              autoComplete="new-password"
              helper="Harus ada huruf besar, huruf kecil, angka, dan simbol."
            />
            <Input
              label="Konfirmasi Password"
              name="password_confirmation"
              type="password"
              placeholder="Ulangi password"
              value={form.password_confirmation}
              onChange={handleChange}
              error={errors.password_confirmation?.[0]}
              autoComplete="new-password"
            />
          </div>

          <Button
            className="w-full mt-6"
            onClick={handleSubmit}
            disabled={isDisabled}
            isLoading={isLoading}
          >
            Daftar Sekarang
          </Button>

          <p className="text-center text-xs font-semibold text-[#9589c8] mt-5">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-[#7c6af7] font-black">
              Masuk di sini
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}