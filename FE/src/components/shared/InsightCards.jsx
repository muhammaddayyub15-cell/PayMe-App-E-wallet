import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus, Zap, Calendar, ArrowUpRight, Flame } from 'lucide-react'
import { formatRupiahShort } from '../../utils/formatCurrency'

function InsightChip({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-2 font-nunito"
      style={{ background: bg, boxShadow: 'var(--clay-shadow-sm)' }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}22` }}>
        <Icon size={16} color={color} strokeWidth={2.5} />
      </div>
      <p className="text-[10px] font-black tracking-wide uppercase" style={{ color: 'var(--clay-muted-lt)' }}>{label}</p>
      <p className="text-sm font-black leading-tight" style={{ color: 'var(--clay-text)' }}>{value}</p>
    </div>
  )
}

export default function InsightCards({ transactions = [], balance = 0 }) {
  const insights = useMemo(() => {
    const now = new Date()

    // This month
    const thisMonth = transactions.filter(tx => {
      const d = new Date(tx.created_at)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })

    // Last month
    const lastMonth = transactions.filter(tx => {
      const d = new Date(tx.created_at)
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear()
    })

    const outThis  = thisMonth.filter(t => t.type === 'TRANSFER_OUT').reduce((s, t) => s + t.amount, 0)
    const outLast  = lastMonth.filter(t => t.type === 'TRANSFER_OUT').reduce((s, t) => s + t.amount, 0)
    const trend    = outLast === 0 ? 0 : Math.round(((outThis - outLast) / outLast) * 100)

    // Rata-rata harian
    const daysInMonth = now.getDate()
    const avgDaily = daysInMonth > 0 ? Math.round(outThis / daysInMonth) : 0

    // Hari tersibuk
    const dayCount = {}
    transactions.forEach(tx => {
      const day = new Date(tx.created_at).toLocaleDateString('id-ID', { weekday: 'long' })
      dayCount[day] = (dayCount[day] || 0) + 1
    })
    const busiestDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-'

    // Transaksi terbesar
    const biggest = transactions.filter(t => t.type === 'TRANSFER_OUT').reduce((max, t) => t.amount > max ? t.amount : max, 0)

    // Streak
    let streak = 0
    for (let i = 0; i < 30; i++) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const hasTx = transactions.some(tx => new Date(tx.created_at).toDateString() === d.toDateString())
      if (hasTx) streak++; else break
    }

    return { trend, avgDaily, busiestDay, biggest, streak }
  }, [transactions])

  const TrendIcon = insights.trend > 0 ? TrendingUp : insights.trend < 0 ? TrendingDown : Minus
  const trendColor = insights.trend > 0 ? 'var(--clay-danger)' : insights.trend < 0 ? 'var(--clay-teal)' : 'var(--clay-muted)'

  return (
    <div className="grid grid-cols-2 gap-3">
      <InsightChip
        icon={TrendIcon}
        label="Trend Pengeluaran"
        value={insights.trend === 0 ? 'Stabil' : `${insights.trend > 0 ? '+' : ''}${insights.trend}% vs bulan lalu`}
        color={trendColor}
        bg="var(--clay-surface)"
      />
      <InsightChip
        icon={Calendar}
        label="Rata-rata Harian"
        value={formatRupiahShort(insights.avgDaily)}
        color="var(--clay-blue)"
        bg="var(--clay-surface)"
      />
      <InsightChip
        icon={Zap}
        label="Hari Tersibuk"
        value={insights.busiestDay}
        color="var(--clay-yellow)"
        bg="var(--clay-surface)"
      />
      <InsightChip
        icon={ArrowUpRight}
        label="Transfer Terbesar"
        value={formatRupiahShort(insights.biggest)}
        color="var(--clay-primary)"
        bg="var(--clay-surface)"
      />
      <InsightChip
        icon={Flame}
        label="Streak Aktif"
        value={`${insights.streak} hari berturut`}
        color="var(--clay-pink)"
        bg="var(--clay-surface)"
      />
    </div>
  )
}