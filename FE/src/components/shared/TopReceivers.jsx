import { useMemo } from 'react'
import { formatRupiahShort } from '../../utils/formatCurrency'

const AVATAR_COLORS = [
  'linear-gradient(135deg,#8060e8,#5030c0)',
  'linear-gradient(135deg,#e060a0,#c03070)',
  'linear-gradient(135deg,#30b880,#108858)',
]

export default function TopReceivers({ transactions = [], onTransfer }) {
  const receivers = useMemo(() => {
    const map = {}
    transactions
      .filter(tx => tx.type === 'TRANSFER_OUT' && tx.counterparty)
      .forEach(tx => {
        if (!map[tx.counterparty]) {
          map[tx.counterparty] = { name: tx.counterparty, identifier: tx.counterparty_identifier, count: 0, total: 0 }
        }
        map[tx.counterparty].count++
        map[tx.counterparty].total += tx.amount
      })
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 3)
  }, [transactions])

  if (!receivers.length) return null

  return (
    <div className="rounded-3xl p-5 font-nunito flex flex-col gap-4"
      style={{ background: 'var(--clay-surface)', boxShadow: 'var(--clay-shadow)' }}>
      <p className="text-sm font-black" style={{ color: 'var(--clay-text)' }}>Penerima Tersering</p>

      <div className="flex flex-col gap-2">
        {receivers.map((r, i) => {
          const initials = r.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
          return (
            <button
              key={r.name}
              onClick={() => onTransfer?.(r.identifier ?? r.name)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl border-none cursor-pointer text-left transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
              style={{ background: 'rgba(91,63,219,0.05)',
                boxShadow: '3px 4px 10px rgba(91,63,219,0.08),-1px -1px 4px rgba(255,255,255,0.9)' }}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                  boxShadow: '3px 4px 10px rgba(80,48,192,0.3),-1px -1px 4px rgba(255,255,255,0.5),inset 1px 1px 4px rgba(255,255,255,0.2)' }}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black truncate" style={{ color: 'var(--clay-text)' }}>{r.name}</p>
                <p className="text-[10px] font-semibold" style={{ color: 'var(--clay-muted-lt)' }}>
                  {r.count}x · {formatRupiahShort(r.total)}
                </p>
              </div>
              <span className="text-[10px] font-black flex-shrink-0" style={{ color: 'var(--clay-primary)' }}>Transfer →</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}