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
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#9b87f5] to-[#7c6af7] flex items-center justify-center mb-4 clay-icon-purple">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L6 8h4v6H8l4 8 4-8h-2V8h4L12 2z" fill="white" />
            </svg>
          </div>
          <h1 className="text-2xl font-black" style={{ color: '#1a1060' }}>Buat Akun</h1>
          <p className="text-sm font-semibold text-[#9589c8] mt-1">Daftar dan mulai pakai PayMe</p>
        </div>

        {/* Card */}
        <div className="clay-card bg-white/75 rounded-3xl p-6">

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