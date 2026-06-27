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
    <div className="rounded-3xl p-5 font-nunito"
      style={{
        background: '#fff',
        boxShadow: '10px 12px 32px rgba(160,148,220,0.22),-6px -6px 18px #ffffff,inset 5px 5px 14px rgba(255,255,255,0.98),inset -5px -5px 14px rgba(160,140,220,0.20)',
      }}>
      <p className="text-sm font-black mb-1" style={{ color: '#1a1060' }}>Komposisi</p>
      <p className="text-[11px] font-semibold mb-3" style={{ color: '#9589c8' }}>Distribusi transaksi</p>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip
            formatter={(v) => formatRupiahShort(v)}
            contentStyle={{ borderRadius: 16, fontSize: 11, fontFamily: 'Nunito', fontWeight: 700, border: 'none', boxShadow: '4px 6px 16px rgba(160,148,220,0.25)' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-1.5 mt-2">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center justify-between text-[11px] font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
              <span style={{ color: '#9589c8' }}>{d.name}</span>
            </span>
            <span style={{ color: '#1a1060' }}>{formatRupiahShort(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}