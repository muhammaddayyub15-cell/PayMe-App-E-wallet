import { useMemo } from 'react'
import { Plus } from 'lucide-react'

const AVATAR_COLORS = [
  'linear-gradient(135deg,#8060e8,#5030c0)',
  'linear-gradient(135deg,#e060a0,#c03070)',
  'linear-gradient(135deg,#30b880,#108858)',
  'linear-gradient(135deg,#4890e0,#2060b8)',
]

export default function QuickTransferBar({ transactions = [], onTransfer }) {
  const recents = useMemo(() => {
    const seen = new Set()
    return transactions
      .filter(tx => tx.type === 'TRANSFER_OUT' && tx.counterparty)
      .filter(tx => { if (seen.has(tx.counterparty)) return false; seen.add(tx.counterparty); return true })
      .slice(0, 4)
      .map(tx => ({ name: tx.counterparty, identifier: tx.counterparty_identifier, initials: tx.counterparty.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() }))
  }, [transactions])

  if (!recents.length) return null

  return (
    <div className="rounded-3xl p-5 font-nunito" style={{ background: 'var(--clay-surface)', boxShadow: 'var(--clay-shadow)' }}>
      <p className="text-sm font-black mb-4" style={{ color: 'var(--clay-text)' }}>Transfer Cepat</p>
      <div className="flex gap-4">
        {recents.map((r, i) => (
          <button
            key={r.name}
            onClick={() => onTransfer(r.identifier ?? r.name)}
            className="flex flex-col items-center gap-2 border-none bg-transparent cursor-pointer group"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black text-white transition-transform group-hover:scale-105"
                            style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length], boxShadow: '4px 6px 16px rgba(80,48,192,0.35), -2px -2px 8px rgba(255,255,255,0.5), inset 2px 2px 6px rgba(255,255,255,0.25), inset -2px -2px 6px rgba(40,20,120,0.3)' }}
            >
              {r.initials}
            </div>
            <span className="text-[10px] font-bold max-w-[52px] truncate" style={{ color: 'var(--clay-muted)' }}>{r.name}</span>
          </button>
        ))}
        <button
          onClick={() => onTransfer('')}
          className="flex flex-col items-center gap-2 border-none bg-transparent cursor-pointer group"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
                        style={{ background: 'rgba(91,63,219,0.08)', boxShadow: '4px 6px 16px rgba(91,63,219,0.15), -2px -2px 8px rgba(255,255,255,0.8), inset 2px 2px 6px rgba(255,255,255,0.9), inset -2px -2px 6px rgba(180,170,230,0.3)' }}

          >
            <Plus size={20} color="var(--clay-primary)" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-bold" style={{ color: 'var(--clay-muted)' }}>Lainnya</span>
        </button>
      </div>
    </div>
  )
}