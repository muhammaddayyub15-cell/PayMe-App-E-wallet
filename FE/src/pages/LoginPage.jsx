// src/pages/LoginPage.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import useToastStore from '../stores/toastStore'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Toast from '../components/ui/Toast'

export default function LoginPage() {
  const navigate        = useNavigate()
  const { login }       = useAuth()
  const { addToast }    = useToastStore()

  const [form, setForm]       = useState({ email: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrors(er => ({ ...er, [e.target.name]: null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})
    try {
      await login(form.email, form.password)
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

  const isDisabled = !form.email || !form.password || isLoading

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ece9ff] via-[#ddd8ff] to-[#e8e4ff] flex items-center justify-center p-4 font-nunito">
      <Toast />

      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#9b87f5] to-[#7c6af7] flex items-center justify-center mb-4 clay-icon-purple">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L6 8h4v6H8l4 8 4-8h-2V8h4L12 2z" fill="white" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-[#3d2f8a]">PayMe</h1>
          <p className="text-sm font-semibold text-[#9589c8] mt-1">Masuk ke akun kamu</p>
        </div>

        {/* Card */}
        <div className="clay-card bg-white/75 rounded-3xl p-6">

          <div className="flex flex-col gap-4">
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
              label="Password"
              name="password"
              type="password"
              placeholder="Masukkan password"
              value={form.password}
              onChange={handleChange}
              error={errors.password?.[0]}
              autoComplete="current-password"
            />
          </div>

          <Button
            className="w-full mt-6"
            onClick={handleSubmit}
            disabled={isDisabled}
            isLoading={isLoading}
          >
            Masuk
          </Button>

          <p className="text-center text-xs font-700 text-[#9589c8] mt-5">
            Belum punya akun?{' '}
            <Link to="/register" className="text-[#7c6af7] font-black">
              Daftar sekarang
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}