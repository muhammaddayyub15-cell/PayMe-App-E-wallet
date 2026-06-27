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
            style={{ background: 'var(--clay-surface)', boxShadow: 'var(--clay-shadow)' }}>
            <p className="text-sm font-black self-start" style={{ color: 'var(--clay-text)' }}>QR Profil Saya</p>
            <p className="text-[11px] font-semibold self-start -mt-2" style={{ color: 'var(--clay-muted-lt)' }}>Scan untuk transfer ke akun ini</p>

            <div className="rounded-2xl p-3" style={{ background: 'rgba(91,63,219,0.06)', boxShadow: 'var(--clay-shadow-inset)' }}>
                <QRCodeSVG
                    value={identifier}
                    size={120}
                    fgColor="var(--clay-primary)"
                    bgColor="transparent"
                    level="M"
                />
            </div>

            <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border-none cursor-pointer transition-all duration-150"
                style={{
                    background: copied ? 'var(--clay-teal)' : 'rgba(91,63,219,0.1)',
                    color: copied ? 'white' : 'var(--clay-primary)',
                }}
            >
                {copied ? <Check size={13} strokeWidth={3} /> : <Copy size={13} strokeWidth={2.5} />}
                {copied ? 'Tersalin!' : identifier}
            </button>
        </div>
    )
}