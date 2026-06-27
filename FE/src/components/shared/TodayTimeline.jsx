import { useMemo } from 'react'
import { formatRupiah } from '../../utils/formatCurrency'

const typeConfig = {
  TOPUP:        { label: 'Top Up',   color: '#3b82f6', bg: 'rgba(59,130,246,0.10)', symbol: '⬆' },
  TRANSFER_IN:  { label: 'Masuk',    color: '#10b981', bg: 'rgba(16,185,129,0.10)', symbol: '↙' },
  TRANSFER_OUT: { label: 'Keluar',   color: '#ef4444', bg: 'rgba(239,68,68,0.10)',  symbol: '↗' },
  ADJUSTMENT:   { label: 'Koreksi', color: '#d97706', bg: 'rgba(217,119,6,0.10)',  symbol: '⚙' },
}

export default function TodayTimeline({ transactions = [] }) {
  const todayTx = useMemo(() => {
    const today = new Date().toDateString()
    return transactions
      .filter(tx => new Date(tx.created_at).toDateString() === today)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [transactions])

  if (!todayTx.length) return null

  return (
    <div className="rounded-3xl p-5 font-nunito flex flex-col gap-4"
      style={{ background: 'var(--clay-surface)', boxShadow: 'var(--clay-shadow)' }}>
      <div>
        <p className="text-sm font-black" style={{ color: 'var(--clay-text)' }}>Aktivitas Hari Ini</p>
        <p className="text-[10px] font-bold" style={{ color: 'var(--clay-muted-lt)' }}>{todayTx.length} transaksi</p>
      </div>

      <div className="flex flex-col gap-2">
        {todayTx.map((tx, i) => {
          const cfg = typeConfig[tx.type] ?? typeConfig.ADJUSTMENT
          const time = new Date(tx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          const isLast = i === todayTx.length - 1

          return (
            <div key={tx.id} className="flex gap-3 items-start">
              {/* Timeline line */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black"
                  style={{ background: cfg.bg, color: cfg.color,
                    boxShadow: '3px 4px 10px rgba(0,0,0,0.08),-1px -1px 4px rgba(255,255,255,0.8),inset 1px 1px 4px rgba(255,255,255,0.6)' }}>
                  {cfg.symbol}
                </div>
                {!isLast && <div className="w-0.5 h-4 mt-1" style={{ background: 'var(--clay-border)' }} />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-black truncate" style={{ color: 'var(--clay-text)' }}>
                    {tx.counterparty ?? 'Top-Up Saldo'}
                  </p>
                  <p className="text-xs font-black whitespace-nowrap flex-shrink-0"
                    style={{ color: cfg.color }}>
                    {tx.type === 'TRANSFER_OUT' ? '-' : '+'}{formatRupiah(tx.amount)}
                  </p>
                </div>
                <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--clay-muted-lt)' }}>
                  {time} · {cfg.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}