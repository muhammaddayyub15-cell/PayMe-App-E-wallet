import { useMemo } from 'react'

export default function ActivityHeatmap({ transactions = [] }) {
  const cells = useMemo(() => {
    const map = {}
    transactions.forEach(tx => {
      const key = new Date(tx.created_at).toDateString()
      map[key] = (map[key] || 0) + 1
    })
    const result = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toDateString()
      result.push({ date: d, count: map[key] || 0, label: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) })
    }
    return result
  }, [transactions])

  const max = Math.max(...cells.map(c => c.count), 1)

  function cellColor(count) {
    if (count === 0) return 'rgba(91,63,219,0.07)'
    const intensity = count / max
    if (intensity < 0.33) return 'rgba(91,63,219,0.25)'
    if (intensity < 0.66) return 'rgba(91,63,219,0.55)'
    return 'rgba(91,63,219,0.90)'
  }

  return (
    <div className="rounded-3xl p-5 font-nunito" style={{ background: 'var(--clay-surface)', boxShadow: 'var(--clay-shadow)' }}>
      <p className="text-sm font-black mb-1" style={{ color: 'var(--clay-text)' }}>Aktivitas 30 Hari</p>
      <p className="text-[11px] font-semibold mb-4" style={{ color: 'var(--clay-muted-lt)' }}>Intensitas transaksi harian</p>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
        {cells.map((c, i) => (
          <div
            key={i}
            title={`${c.label}: ${c.count} transaksi`}
            className="rounded-lg cursor-default transition-transform hover:scale-110"
            style={{ aspectRatio: '1', background: cellColor(c.count) }}
          />
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-3 text-[10px] font-bold" style={{ color: 'var(--clay-muted-lt)' }}>
        <span>Sedikit</span>
        {[0.07, 0.25, 0.55, 0.90].map(o => (
          <span key={o} className="w-3 h-3 rounded" style={{ background: `rgba(91,63,219,${o})` }} />
        ))}
        <span>Banyak</span>
      </div>
    </div>
  )
}