import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus, Zap, Calendar, ArrowUpRight, Flame } from 'lucide-react'
import { formatRupiahShort } from '../../utils/formatCurrency'

// ── Chip ─────────────────────────────────────────────────────────────────────
function InsightChip({ icon: Icon, label, value, color, iconBg }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-2 font-nunito"
      style={{
        background: '#fff',
        boxShadow: '8px 10px 26px rgba(160,148,220,0.20),-5px -5px 14px #ffffff,inset 4px 4px 12px rgba(255,255,255,0.98),inset -4px -4px 12px rgba(160,140,220,0.18)',
      }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ background: iconBg }}>
        <Icon size={16} color={color} strokeWidth={2.5} />
      </div>
      <p className="text-[10px] font-black tracking-wide uppercase" style={{ color: '#9589c8' }}>{label}</p>
      <p className="text-sm font-black leading-tight" style={{ color: '#1a1060' }}>{value}</p>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function InsightCards({ transactions = [], balance = 0 }) {
  const insights = useMemo(() => {
    const now = new Date()

    const thisMonth = transactions.filter(tx => {
      const d = new Date(tx.created_at)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    const lastMonth = transactions.filter(tx => {
      const d = new Date(tx.created_at)
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear()
    })

    const outThis = thisMonth.filter(t => t.type === 'TRANSFER_OUT').reduce((s, t) => s + t.amount, 0)
    const outLast = lastMonth.filter(t => t.type === 'TRANSFER_OUT').reduce((s, t) => s + t.amount, 0)
    const trend   = outLast === 0 ? 0 : Math.round(((outThis - outLast) / outLast) * 100)

    const daysInMonth = now.getDate()
    const avgDaily = daysInMonth > 0 ? Math.round(outThis / daysInMonth) : 0

    const dayCount = {}
    transactions.forEach(tx => {
      const day = new Date(tx.created_at).toLocaleDateString('id-ID', { weekday: 'long' })
      dayCount[day] = (dayCount[day] || 0) + 1
    })
    const busiestDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-'

    const biggest = transactions
      .filter(t => t.type === 'TRANSFER_OUT')
      .reduce((max, t) => t.amount > max ? t.amount : max, 0)

    let streak = 0
    for (let i = 0; i < 30; i++) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const hasTx = transactions.some(tx => new Date(tx.created_at).toDateString() === d.toDateString())
      if (hasTx) streak++; else break
    }

    return { trend, avgDaily, busiestDay, biggest, streak }
  }, [transactions])

  const TrendIcon  = insights.trend > 0 ? TrendingUp : insights.trend < 0 ? TrendingDown : Minus
  const trendColor = insights.trend > 0 ? '#e05050' : insights.trend < 0 ? '#30b880' : '#9589c8'
  const trendBg    = insights.trend > 0 ? 'rgba(220,80,80,0.10)' : insights.trend < 0 ? 'rgba(48,184,128,0.10)' : 'rgba(149,137,200,0.10)'

  const chips = [
    {
      icon: TrendIcon,
      label: 'Trend Pengeluaran',
      value: insights.trend === 0 ? 'Stabil' : `${insights.trend > 0 ? '+' : ''}${insights.trend}% vs bulan lalu`,
      color: trendColor,
      iconBg: trendBg,
    },
    {
      icon: Calendar,
      label: 'Rata-rata Harian',
      value: formatRupiahShort(insights.avgDaily),
      color: '#4890e0',
      iconBg: 'rgba(72,144,224,0.10)',
    },
    {
      icon: Zap,
      label: 'Hari Tersibuk',
      value: insights.busiestDay,
      color: '#e0a800',
      iconBg: 'rgba(224,168,0,0.10)',
    },
    {
      icon: ArrowUpRight,
      label: 'Transfer Terbesar',
      value: formatRupiahShort(insights.biggest),
      color: '#5b3fdb',
      iconBg: 'rgba(91,63,219,0.10)',
    },
    {
      icon: Flame,
      label: 'Streak Aktif',
      value: `${insights.streak} hari berturut`,
      color: '#e0509a',
      iconBg: 'rgba(224,80,154,0.10)',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {chips.map(c => (
        <InsightChip key={c.label} {...c} />
      ))}
    </div>
  )
}