import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatRupiahShort } from '../../utils/formatCurrency'

const COLORS = ['#5b3fdb', '#30b880', '#ff7eb6']
const LABELS = { TOPUP: 'Top-Up', TRANSFER_OUT: 'Transfer Keluar', TRANSFER_IN: 'Transfer Masuk' }

export default function DonutChart({ transactions = [] }) {
  const data = useMemo(() => {
    const map = { TOPUP: 0, TRANSFER_OUT: 0, TRANSFER_IN: 0 }
    transactions.forEach(tx => { if (map[tx.type] !== undefined) map[tx.type] += tx.amount })
    return Object.entries(map)
      .filter(([, v]) => v > 0)
      .map(([type, value]) => ({ name: LABELS[type], value }))
  }, [transactions])

  if (!data.length) return null

  return (
    <div className="rounded-3xl p-5 font-nunito" style={{ background: 'var(--clay-surface)', boxShadow: 'var(--clay-shadow)' }}>
      <p className="text-sm font-black mb-1" style={{ color: 'var(--clay-text)' }}>Komposisi</p>
      <p className="text-[11px] font-semibold mb-3" style={{ color: 'var(--clay-muted-lt)' }}>Distribusi transaksi</p>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v) => formatRupiahShort(v)} contentStyle={{ borderRadius: 16, fontSize: 11, fontFamily: 'Nunito', fontWeight: 700 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-1.5 mt-2">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center justify-between text-[11px] font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
              <span style={{ color: 'var(--clay-muted)' }}>{d.name}</span>
            </span>
            <span style={{ color: 'var(--clay-text)' }}>{formatRupiahShort(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}