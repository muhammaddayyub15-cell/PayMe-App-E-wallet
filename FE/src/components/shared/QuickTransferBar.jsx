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
      .map(tx => ({
        name: tx.counterparty,
        identifier: tx.counterparty_identifier,
        initials: tx.counterparty.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      }))
  }, [transactions])

  if (!recents.length) return null

  return (
    <div className="rounded-3xl p-5 font-nunito"
      style={{
        background: '#fff',
        boxShadow: '10px 12px 32px rgba(160,148,220,0.22),-6px -6px 18px #ffffff,inset 5px 5px 14px rgba(255,255,255,0.98),inset -5px -5px 14px rgba(160,140,220,0.20)',
      }}>
      <p className="text-sm font-black mb-4" style={{ color: '#1a1060' }}>Transfer Cepat</p>
      <div className="flex gap-4">
        {recents.map((r, i) => (
          <button key={r.name} onClick={() => onTransfer(r.identifier ?? r.name)}
            className="flex flex-col items-center gap-2 border-none bg-transparent cursor-pointer group">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black text-white transition-transform group-hover:scale-105 group-hover:-translate-y-0.5"
              style={{
                background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                boxShadow: '6px 8px 20px rgba(80,48,192,0.32),-3px -3px 10px rgba(255,255,255,0.60),inset 3px 3px 8px rgba(255,255,255,0.28),inset -3px -3px 8px rgba(40,20,120,0.28)',
              }}>
              {r.initials}
            </div>
            <span className="text-[10px] font-bold max-w-[52px] truncate" style={{ color: '#6b5b9e' }}>{r.name}</span>
          </button>
        ))}
        <button onClick={() => onTransfer('')}
          className="flex flex-col items-center gap-2 border-none bg-transparent cursor-pointer group">
          <div className="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 group-hover:-translate-y-0.5"
            style={{
              background: 'rgba(91,63,219,0.08)',
              boxShadow: '6px 8px 18px rgba(160,148,220,0.22),-3px -3px 10px #ffffff,inset 3px 3px 8px rgba(255,255,255,0.95),inset -3px -3px 8px rgba(160,140,220,0.20)',
            }}>
            <Plus size={20} color="#5b3fdb" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-bold" style={{ color: '#6b5b9e' }}>Lainnya</span>
        </button>
      </div>
    </div>
  )
}