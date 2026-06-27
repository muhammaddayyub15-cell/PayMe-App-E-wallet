import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatRupiahShort } from '../../utils/formatCurrency'

function ClayTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-2xl px-3 py-2 text-xs font-bold font-nunito"
      style={{ background: '#fff', boxShadow: '4px 6px 16px rgba(160,148,220,0.25)', color: '#1a1060', border: 'none' }}>
      <p className="mb-1" style={{ color: '#9589c8' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === 'keluar' ? '↗ Keluar' : '↙ Masuk'}: {formatRupiahShort(p.value)}
        </p>
      ))}
    </div>
  )
}

function buildChartData(transactions) {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toLocaleDateString('id-ID', { weekday: 'short' })
    const dateStr = d.toDateString()
    const dayTx = transactions.filter(tx => new Date(tx.created_at).toDateString() === dateStr)
    days.push({
      name: key,
      masuk: dayTx.filter(t => t.type === 'TRANSFER_IN' || t.type === 'TOPUP').reduce((s, t) => s + t.amount, 0),
      keluar: dayTx.filter(t => t.type === 'TRANSFER_OUT').reduce((s, t) => s + t.amount, 0),
    })
  }
  return days
}

export default function SpendingChart({ transactions = [] }) {
  const data = useMemo(() => buildChartData(transactions), [transactions])

  return (
    <div className="rounded-3xl p-5 font-nunito"
      style={{
        background: '#fff',
        boxShadow: '10px 12px 32px rgba(160,148,220,0.22),-6px -6px 18px #ffffff,inset 5px 5px 14px rgba(255,255,255,0.98),inset -5px -5px 14px rgba(160,140,220,0.20)',
      }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-black" style={{ color: '#1a1060' }}>Aktivitas 7 Hari</p>
          <p className="text-[11px] font-semibold" style={{ color: '#9589c8' }}>Masuk vs Keluar</p>
        </div>
        <div className="flex gap-3 text-[10px] font-bold" style={{ color: '#6b5b9e' }}>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#30b880' }} />Masuk
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#5b3fdb' }} />Keluar
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barGap={4}>
          <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: '#9589c8', fontFamily: 'Nunito' }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip content={<ClayTooltip />} cursor={{ fill: 'rgba(91,63,219,0.06)', radius: 8 }} />
          <Bar dataKey="masuk" fill="#30b880" radius={[6, 6, 0, 0]} maxBarSize={28} />
          <Bar dataKey="keluar" fill="#5b3fdb" radius={[6, 6, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}