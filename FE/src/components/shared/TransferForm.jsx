import { useState } from 'react'
import { transfer } from '../../api/transactionApi'
import { sendOtp } from '../../api/otpApi'
import useWalletStore from '../../stores/walletStore'
import useToastStore from '../../stores/toastStore'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import OtpModal from './OtpModal'
import { formatRupiah } from '../../utils/formatCurrency'
import { generateIdempotencyKey } from '../../utils/idempotency'
import { validateTransferAmount, validateReceiver, validateSufficient } from '../../utils/validators'


export default function TransferForm({ onSuccess, onCancel, defaultReceiver = '' }) {
  const [form, setForm] = useState({ receiver_identifier: defaultReceiver, amount: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showOtp, setShowOtp] = useState(false)
  // Dibuat sekali per submit-session (saat handleReview), dipakai ulang untuk
  // retry setelah OTP — supaya request pertama (403 otp_required) dan request
  // kedua (setelah verify OTP) dianggap transaksi yang sama oleh EnsureIdempotency.
  const [idempotencyKey, setIdempotencyKey] = useState(null)
  const [otpVerified, setOtpVerified] = useState(false)

  const balance = useWalletStore(s => s.balance)
  const setWallet = useWalletStore(s => s.setWallet)
  const { addToast } = useToastStore()

  // Validasi client-side 
  const validate = () => {
    const errs = {}

    const receiverErr = validateReceiver(form.receiver_identifier)
    if (receiverErr) errs.receiver_identifier = [receiverErr]

    const amountErr = validateTransferAmount(form.amount)
    if (amountErr) {
      errs.amount = [amountErr]
    } else {
      const sufficientErr = validateSufficient(form.amount, balance)
      if (sufficientErr) errs.amount = [sufficientErr]
    }

    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const val = name === 'amount' ? value.replace(/\D/g, '') : value
    setForm(f => ({ ...f, [name]: val }))
    setErrors(er => ({ ...er, [name]: null }))
  }

  // Step 1 — validasi → generate idempotency key baru → tampil modal konfirmasi
  const handleReview = () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setIdempotencyKey(generateIdempotencyKey())
    setShowConfirm(true)
  }

  // Step 2 — eksekusi transfer setelah konfirmasi (cek OTP grace period dulu)
  const executeTransfer = async (isOtpVerified = false) => {
    setIsLoading(true)
    try {
      const res = await transfer(form.receiver_identifier, parseInt(form.amount, 10), idempotencyKey, isOtpVerified || otpVerified)
      const data = res.data.data

      // Saldo diambil dari balance_after milik server, BUKAN dihitung manual
      // di frontend — server adalah satu-satunya sumber kebenaran saldo.
      setWallet({ balance: data.balance_after, currency: 'IDR' })

      addToast(
        `Transfer ${formatRupiah(data.amount)} ke ${data.receiver_name} berhasil!`,
        'success'
      )
      setOtpVerified(false)
      setShowConfirm(false)
      onSuccess?.()
    } catch (err) {
      const data = err?.response?.data
      const status = err?.response?.status

      setShowConfirm(false)

      // Backend minta OTP — kirim OTP ke email lalu tampil modal
      if (status === 403 && data?.otp_required) {
        try {
          await sendOtp()
          console.log('OTP sent — showing modal')
          setShowOtp(true)
        } catch (otpErr) {
          console.error('OTP send failed:', otpErr?.response?.data)
          addToast('Gagal mengirim OTP. Coba lagi.', 'error')
        }
        return
      }
      console.log('status:', status, 'data:', data)

      if (status === 422) {
        setErrors(data?.errors ?? {})
        addToast(data?.message ?? 'Transfer gagal.', 'error')
      } else if (status === 429) {
        addToast(
          err.retryAfter
            ? `Terlalu banyak percobaan. Coba lagi dalam ${err.retryAfter} menit.`
            : 'Terlalu banyak percobaan. Coba lagi nanti.',
          'error'
        )
      } else {
        addToast(data?.message ?? 'Terjadi kesalahan. Coba lagi.', 'error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = () => executeTransfer(false)

  const amount = parseInt(form.amount || '0', 10)
  const afterBal = balance !== null ? balance - amount : null
  const isDisabled = !form.receiver_identifier || !form.amount
    || Object.values(errors).some(Boolean) || isLoading

  return (
    <>
      {/* OTP Modal — muncul ketika backend minta verifikasi OTP */}
      {showOtp && (
        <OtpModal
          onVerified={() => {
            setShowOtp(false)
          setOtpVerified(true)
          executeTransfer(true)
          }}
          onClose={() => setShowOtp(false)}
        />
      )}

      {/* Konfirmasi modal */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        title="Konfirmasi Transfer"
        confirmLabel="Ya, Transfer"
        isLoading={isLoading}
      >
        <div className="flex flex-col gap-3">
          {/* Row: penerima */}
          <div className="clay-card bg-white/75 rounded-2xl px-4 py-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#9589c8]">Penerima</span>
              <span className="text-sm font-black text-[#3d2f8a]">
                {form.receiver_identifier}
              </span>
            </div>
          </div>

          {/* Row: nominal */}
          <div className="clay-card bg-white/75 rounded-2xl px-4 py-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#9589c8]">Nominal</span>
              <span className="text-lg font-black text-[#3d2f8a]">
                {formatRupiah(amount)}
              </span>
            </div>
          </div>

          {/* Row: saldo sesudah */}
          {afterBal !== null && (
            <div className="clay-card bg-white/75 rounded-2xl px-4 py-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#9589c8]">Saldo setelah</span>
                <span className={`text-sm font-black ${afterBal < 0 ? 'text-red-500' : 'text-[#10b981]'}`}>
                  {formatRupiah(afterBal)}
                </span>
              </div>
            </div>
          )}

          <p className="text-xs font-semibold text-[#9589c8] text-center mt-1">
            Transaksi tidak dapat dibatalkan setelah dikonfirmasi.
          </p>
        </div>
      </Modal>

      {/* Form */}
      <div className="flex flex-col gap-5 font-nunito">

        {/* Header */}
        <div>
          <h2 className="text-lg font-black text-[#3d2f8a]">Transfer Saldo</h2>
          <p className="text-xs font-semibold text-[#9589c8] mt-0.5">
            Min. Rp 1.000 · Maks. Rp 50.000.000
          </p>
        </div>

        {/* Saldo tersedia */}
        {balance !== null && (
          <div className="clay-card bg-white/75 rounded-2xl px-4 py-3 flex justify-between items-center">
            <span className="text-xs font-bold text-[#9589c8]">Saldo tersedia</span>
            <span className="text-sm font-black text-[#3d2f8a]">{formatRupiah(balance)}</span>
          </div>
        )}

        <Input
          label="Penerima (Email / No. HP)"
          name="receiver_identifier"
          type="text"
          placeholder="ani@example.com atau 08123456789"
          value={form.receiver_identifier}
          onChange={handleChange}
          error={errors.receiver_identifier?.[0]}
        />

        <Input
          label="Nominal Transfer"
          name="amount"
          type="text"
          inputMode="numeric"
          placeholder="Contoh: 25000"
          value={form.amount}
          onChange={handleChange}
          error={errors.amount?.[0]}
        />

        {/* Preview saldo setelah */}
        {form.amount && !errors.amount && afterBal !== null && (
          <div className="clay-card bg-white/75 rounded-2xl px-4 py-3 flex justify-between items-center">
            <span className="text-xs font-bold text-[#9589c8]">Saldo setelah transfer</span>
            <span className={`text-sm font-black ${afterBal < 0 ? 'text-red-500' : 'text-[#10b981]'}`}>
              {formatRupiah(afterBal)}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-1">
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            Batal
          </Button>
          <Button
            onClick={handleReview}
            disabled={isDisabled}
            isLoading={isLoading}
            className="flex-1"
          >
            Lanjutkan
          </Button>
        </div>

      </div>
    </>
  )
}