import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Check } from 'lucide-react'
import useAuthStore from '../../stores/authStore'

export default function QrProfileCard() {
  const user = useAuthStore(s => s.user)
  const [copied, setCopied] = useState(false)
  const identifier = user?.email ?? user?.phone ?? ''

  const handleCopy = () => {
    navigator.clipboard.writeText(identifier)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-3xl p-5 font-nunito flex flex-col items-center gap-3"
      style={{
        background: '#fff',
        boxShadow: '10px 12px 32px rgba(160,148,220,0.22),-6px -6px 18px #ffffff,inset 5px 5px 14px rgba(255,255,255,0.98),inset -5px -5px 14px rgba(160,140,220,0.20)',
      }}>
      <p className="text-sm font-black self-start" style={{ color: '#1a1060' }}>QR Profil Saya</p>
      <p className="text-[11px] font-semibold self-start -mt-2" style={{ color: '#9589c8' }}>Scan untuk transfer ke akun ini</p>

      {/* QR container — clay inset */}
      <div className="rounded-2xl p-3"
        style={{
          background: 'rgba(91,63,219,0.06)',
          boxShadow: 'inset 4px 4px 12px rgba(160,140,220,0.22),inset -4px -4px 12px rgba(255,255,255,0.95)',
        }}>
        <QRCodeSVG
          value={identifier || 'payme'}
          size={120}
          fgColor="#5b3fdb"
          bgColor="transparent"
          level="M"
        />
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border-none cursor-pointer transition-all duration-150 active:scale-95"
        style={{
          background: copied ? 'linear-gradient(135deg,#30b880,#22a870)' : 'rgba(91,63,219,0.08)',
          color: copied ? '#fff' : '#5b3fdb',
          boxShadow: copied
            ? '4px 5px 14px rgba(48,184,128,0.30),-2px -2px 8px rgba(255,255,255,0.60),inset 2px 2px 6px #50d898,inset -2px -2px 6px #18a060'
            : '4px 5px 12px rgba(160,148,220,0.20),-2px -2px 8px #ffffff,inset 2px 2px 6px rgba(255,255,255,0.95),inset -2px -2px 6px rgba(160,140,220,0.18)',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
      >
        {copied ? <Check size={13} strokeWidth={3} /> : <Copy size={13} strokeWidth={2.5} />}
        {copied ? 'Tersalin!' : identifier}
      </button>
    </div>
  )
}