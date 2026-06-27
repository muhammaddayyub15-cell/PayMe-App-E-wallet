import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { formatRupiahShort } from '../../utils/formatCurrency'

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function ClayTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-2xl px-3 py-2 text-xs font-bold font-nunito"
      style={{ background: '#fff', boxShadow: 'var(--clay-shadow-sm)', color: 'var(--clay-text)' }}>
      <p className="mb-1" style={{ color: 'var(--clay-muted-lt)' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === 'keluar' ? '↗ Keluar' : '↙ Masuk'}: {formatRupiahShort(p.value)}
        </p>
      ))}
    </div>
  )
}

// ── Build 7-day data ──────────────────────────────────────────────────────────
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

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SpendingChart({ transactions = [] }) {
  const data = useMemo(() => buildChartData(transactions), [transactions])

  return (
    <div className="rounded-3xl p-5 font-nunito" style={{ background: 'var(--clay-surface)', boxShadow: 'var(--clay-shadow)' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-black" style={{ color: 'var(--clay-text)' }}>Aktivitas 7 Hari</p>
          <p className="text-[11px] font-semibold" style={{ color: 'var(--clay-muted-lt)' }}>Masuk vs Keluar</p>
        </div>
        <div className="flex gap-3 text-[10px] font-bold">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: 'var(--clay-teal)' }} />Masuk</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: 'var(--clay-primary)' }} />Keluar</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barGap={4}>
          <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--clay-muted-lt)', fontFamily: 'Nunito' }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip content={<ClayTooltip />} cursor={{ fill: 'rgba(91,63,219,0.06)', radius: 8 }} />
          <Bar dataKey="masuk" fill="var(--clay-teal)" radius={[6, 6, 0, 0]} maxBarSize={28} />
          <Bar dataKey="keluar" fill="var(--clay-primary)" radius={[6, 6, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}