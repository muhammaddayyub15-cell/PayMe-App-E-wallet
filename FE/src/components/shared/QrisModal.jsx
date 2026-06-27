import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createQrisCharge } from '../../api/walletApi'
import useWallet from '../../hooks/useWallet'

// ── Countdown ─────────────────────────────────────────────────────────────────
const QrisCountdown = ({ expiresAt, onExpire }) => {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    if (!expiresAt) return
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000))
      setRemaining(diff)
      if (diff === 0) onExpire?.()
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt, onExpire])

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  const isUrgent = remaining > 0 && remaining <= 60

  return (
    <p className="text-xs font-black" style={{ color: isUrgent ? '#e03060' : '#9589c8' }}>
      {remaining > 0 ? `Berlaku selama ${mm}:${ss}` : 'QR Code sudah kadaluarsa'}
    </p>
  )
}

// ── Step ──────────────────────────────────────────────────────────────────────
const QrisStep = ({ label, icon, done }) => (
  <div className="flex items-center gap-2.5">
    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 transition-all duration-150"
      style={done ? {
        background: 'linear-gradient(135deg,#90f0c8,#6ee7b7)',
        color: '#fff',
        boxShadow: '3px 4px 10px rgba(48,184,128,0.30),-2px -2px 6px rgba(255,255,255,0.60),inset 2px 2px 5px #b8fce0,inset -2px -2px 5px #30a870',
      } : {
        background: 'rgba(255,255,255,0.80)',
        color: '#6b5fb5',
        boxShadow: '3px 4px 8px rgba(160,148,220,0.18),-2px -2px 6px #ffffff,inset 2px 2px 5px rgba(255,255,255,0.95),inset -2px -2px 5px rgba(160,140,220,0.18)',
      }}>
      {done ? '✓' : icon}
    </div>
    <span className="text-xs font-semibold" style={{ color: '#4a3a8a' }}>{label}</span>
  </div>
)

// ── Main ──────────────────────────────────────────────────────────────────────
const QrisModal = ({ amount, onClose, onSuccess }) => {
  const { t } = useTranslation()
  const { refreshBalance } = useWallet()

  const [phase, setPhase] = useState('loading')
  const [qrData, setQrData] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const pollRef = useRef(null)

  useEffect(() => {
    const fetchCharge = async () => {
      try {
        const res = await createQrisCharge(amount)
        setQrData(res.data)
        setPhase('ready')
      } catch (err) {
        setErrorMsg(err?.response?.data?.message || 'Gagal membuat kode QRIS.')
        setPhase('error')
      }
    }
    fetchCharge()
  }, [amount])

  useEffect(() => {
    if (phase !== 'ready' || !qrData?.merchant_ref) return
    pollRef.current = setInterval(async () => {
      // TODO: GET /api/topup/status/{merchant_ref}
    }, 5000)
    return () => clearInterval(pollRef.current)
  }, [phase, qrData])

  const handleExpire = () => { clearInterval(pollRef.current); setPhase('expired') }
  const handleClose  = () => { clearInterval(pollRef.current); onClose() }

  const amountFormatted = new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(amount)

  const renderContent = () => {
    if (phase === 'loading') return (
      <div className="flex flex-col items-center gap-4 py-10">
        <div className="w-10 h-10 rounded-full animate-spin"
          style={{
            border: '3px solid #e0dbff',
            borderTopColor: '#7c6af7',
            boxShadow: '4px 4px 12px rgba(140,120,220,0.22),-3px -3px 8px #ffffff,inset 2px 2px 6px rgba(255,255,255,0.90),inset -2px -2px 6px rgba(160,140,220,0.20)',
          }} />
        <p className="text-sm font-semibold" style={{ color: '#9589c8' }}>Membuat kode QRIS...</p>
      </div>
    )

    if (phase === 'error') return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg,#ffb8b8,#fca5a5)',
            boxShadow: '6px 8px 20px rgba(220,100,100,0.28),-4px -4px 12px #ffffff,inset 4px 4px 10px #ffd0d0,inset -4px -4px 10px #d05050',
          }}>
          <span className="text-lg font-black" style={{ color: '#c03030' }}>!</span>
        </div>
        <p className="text-sm font-bold" style={{ color: '#c03030' }}>{errorMsg}</p>
        <button onClick={handleClose}
          className="px-5 py-2 rounded-full text-xs font-black border-none cursor-pointer active:scale-95 transition-all"
          style={{
            background: 'rgba(255,255,255,0.80)',
            color: '#5b3fdb',
            boxShadow: '4px 5px 12px rgba(160,148,220,0.20),-2px -2px 8px #ffffff,inset 2px 2px 6px rgba(255,255,255,0.95),inset -2px -2px 6px rgba(160,140,220,0.18)',
          }}>
          Tutup dan coba lagi
        </button>
      </div>
    )

    if (phase === 'expired') return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <p className="text-sm font-bold" style={{ color: '#6b5b9e' }}>Kode QRIS sudah kadaluarsa.</p>
        <button onClick={handleClose}
          className="px-6 py-3 rounded-full text-sm font-black text-white border-none cursor-pointer active:scale-95 transition-all hover:-translate-y-0.5"
          style={{
            background: 'linear-gradient(135deg,#7c6af7,#5b3fdb)',
            boxShadow: '8px 10px 24px rgba(91,63,219,0.35),-4px -4px 12px rgba(255,255,255,0.60),inset 4px 4px 12px #b8a8ff,inset -4px -4px 12px #4030b8',
          }}>
          Buat QR baru
        </button>
      </div>
    )

    return (
      <div className="flex flex-col items-center gap-4">

        {/* QR container — clay inset */}
        <div className="p-3 rounded-2xl"
          style={{
            background: '#fff',
            boxShadow: '6px 8px 20px rgba(160,148,220,0.20),-4px -4px 12px #ffffff,inset 4px 4px 10px rgba(255,255,255,0.98),inset -4px -4px 10px rgba(160,140,220,0.18)',
          }}>
          {qrData?.qr_url ? (
            <img src={qrData.qr_url} alt="QRIS Code" className="w-52 h-52 object-contain rounded-xl" />
          ) : (
            <div className="w-52 h-52 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(91,63,219,0.05)' }}>
              <p className="text-xs text-center px-4" style={{ color: '#9589c8' }}>QR Code akan tampil di sini</p>
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="text-center">
          <p className="text-xs uppercase tracking-wide" style={{ color: '#9589c8' }}>Nominal</p>
          <p className="text-2xl font-black" style={{ color: '#1a1060' }}>{amountFormatted}</p>
        </div>

        {/* Countdown */}
        <QrisCountdown
          expiresAt={qrData?.expired_time ? new Date(qrData.expired_time * 1000) : null}
          onExpire={handleExpire}
        />

        {/* Steps */}
        <div className="w-full rounded-2xl p-4 flex flex-col gap-3 mt-1"
          style={{
            background: 'rgba(255,255,255,0.75)',
            boxShadow: '6px 8px 20px rgba(160,148,220,0.18),-4px -4px 12px #ffffff,inset 3px 3px 10px rgba(255,255,255,0.98),inset -3px -3px 10px rgba(160,140,220,0.16)',
          }}>
          <QrisStep icon="1" label="Buka aplikasi m-banking atau e-wallet" done={false} />
          <QrisStep icon="2" label="Pilih menu Scan QR / QRIS" done={false} />
          <QrisStep icon="3" label="Arahkan kamera ke kode di atas" done={false} />
          <QrisStep icon="4" label="Konfirmasi pembayaran" done={false} />
        </div>

        {/* Merchant ref */}
        {qrData?.merchant_ref && (
          <p className="text-xs font-mono" style={{ color: '#b0a8d8' }}>
            Ref: {qrData.merchant_ref}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 font-nunito"
      style={{ background: 'rgba(80,64,180,0.25)' }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}>

      <div className="w-full max-w-sm rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg,#f0eeff,#e8e3ff)',
          boxShadow: '14px 16px 40px rgba(90,70,200,0.32),-8px -8px 24px rgba(255,255,255,0.70),inset 6px 6px 18px rgba(255,255,255,0.95),inset -6px -6px 18px rgba(160,140,220,0.24)',
        }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(160,140,220,0.15)' }}>
          <div className="flex items-center gap-2">
            <span className="text-base font-black" style={{ color: '#1a1060' }}>Top-up via QRIS</span>
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full"
              style={{
                background: 'rgba(91,63,219,0.10)',
                color: '#5b3fdb',
                boxShadow: '3px 3px 8px rgba(160,148,220,0.20),-2px -2px 6px #ffffff,inset 2px 2px 5px rgba(255,255,255,0.90),inset -2px -2px 5px rgba(0,0,0,0.06)',
              }}>
              Tripay
            </span>
          </div>
          <button onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border-none cursor-pointer transition-all active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.70)',
              color: '#6b5b9e',
              boxShadow: '4px 4px 10px rgba(160,148,220,0.20),-2px -2px 6px #ffffff,inset 2px 2px 5px rgba(255,255,255,0.95),inset -2px -2px 5px rgba(160,140,220,0.18)',
            }}
            aria-label="Tutup">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default QrisModal