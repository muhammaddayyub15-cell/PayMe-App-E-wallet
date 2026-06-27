import { useMemo } from 'react'
import { formatRupiah } from '../../utils/formatCurrency'

const typeConfig = {
  TOPUP:        { label: 'Top Up',  color: '#4890e0', bg: 'rgba(72,144,224,0.10)',  symbol: '⬆' },
  TRANSFER_IN:  { label: 'Masuk',   color: '#30b880', bg: 'rgba(48,184,128,0.10)',  symbol: '↙' },
  TRANSFER_OUT: { label: 'Keluar',  color: '#e05050', bg: 'rgba(224,80,80,0.10)',   symbol: '↗' },
  ADJUSTMENT:   { label: 'Koreksi', color: '#e0a800', bg: 'rgba(224,168,0,0.10)',   symbol: '⚙' },
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
      style={{
        background: '#fff',
        boxShadow: '10px 12px 32px rgba(160,148,220,0.22),-6px -6px 18px #ffffff,inset 5px 5px 14px rgba(255,255,255,0.98),inset -5px -5px 14px rgba(160,140,220,0.20)',
      }}>
      <div>
        <p className="text-sm font-black" style={{ color: '#1a1060' }}>Aktivitas Hari Ini</p>
        <p className="text-[10px] font-bold" style={{ color: '#9589c8' }}>{todayTx.length} transaksi</p>
      </div>

      <div className="flex flex-col gap-2">
        {todayTx.map((tx, i) => {
          const cfg = typeConfig[tx.type] ?? typeConfig.ADJUSTMENT
          const time = new Date(tx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          const isLast = i === todayTx.length - 1

          return (
            <div key={tx.id} className="flex gap-3 items-start">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black"
                  style={{
                    background: cfg.bg,
                    color: cfg.color,
                    boxShadow: '4px 5px 12px rgba(160,148,220,0.18),-2px -2px 6px #ffffff,inset 2px 2px 6px rgba(255,255,255,0.95),inset -2px -2px 6px rgba(160,140,220,0.15)',
                  }}>
                  {cfg.symbol}
                </div>
                {!isLast && <div className="w-0.5 h-4 mt-1" style={{ background: 'rgba(160,140,220,0.25)' }} />}
              </div>

              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-black truncate" style={{ color: '#1a1060' }}>
                    {tx.counterparty ?? 'Top-Up Saldo'}
                  </p>
                  <p className="text-xs font-black whitespace-nowrap flex-shrink-0" style={{ color: cfg.color }}>
                    {tx.type === 'TRANSFER_OUT' ? '-' : '+'}{formatRupiah(tx.amount)}
                  </p>
                </div>
                <p className="text-[10px] font-semibold mt-0.5" style={{ color: '#9589c8' }}>
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