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
      result.push({
        date: d,
        count: map[key] || 0,
        label: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      })
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

  function cellShadow(count) {
    if (count === 0) return '3px 4px 8px rgba(160,148,220,0.14),-2px -2px 6px #ffffff,inset 2px 2px 5px rgba(255,255,255,0.90),inset -2px -2px 5px rgba(160,140,220,0.12)'
    const intensity = count / max
    if (intensity < 0.33) return '3px 4px 8px rgba(91,63,219,0.18),-2px -2px 6px rgba(255,255,255,0.60),inset 2px 2px 5px rgba(180,160,255,0.40),inset -2px -2px 5px rgba(60,40,160,0.18)'
    if (intensity < 0.66) return '3px 4px 10px rgba(91,63,219,0.28),-2px -2px 6px rgba(255,255,255,0.40),inset 2px 2px 5px rgba(160,140,255,0.50),inset -2px -2px 5px rgba(60,40,160,0.30)'
    return '4px 5px 12px rgba(91,63,219,0.38),-2px -2px 6px rgba(255,255,255,0.25),inset 3px 3px 6px rgba(140,120,255,0.60),inset -3px -3px 6px rgba(40,20,140,0.40)'
  }

  return (
    <div className="rounded-3xl p-5 font-nunito"
      style={{
        background: '#fff',
        boxShadow: '10px 12px 32px rgba(160,148,220,0.22),-6px -6px 18px #ffffff,inset 5px 5px 14px rgba(255,255,255,0.98),inset -5px -5px 14px rgba(160,140,220,0.20)',
      }}>
      <p className="text-sm font-black mb-1" style={{ color: '#1a1060' }}>Aktivitas 30 Hari</p>
      <p className="text-[11px] font-semibold mb-4" style={{ color: '#9589c8' }}>Intensitas transaksi harian</p>

      <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
        {cells.map((c, i) => (
          <div
            key={i}
            title={`${c.label}: ${c.count} transaksi`}
            className="rounded-lg cursor-default transition-transform hover:scale-110"
            style={{
              aspectRatio: '1',
              background: cellColor(c.count),
              boxShadow: cellShadow(c.count),
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-1.5 mt-3 text-[10px] font-bold" style={{ color: '#9589c8' }}>
        <span>Sedikit</span>
        {[0.07, 0.25, 0.55, 0.90].map((o, i) => (
          <span key={o} className="w-3 h-3 rounded inline-block"
            style={{
              background: `rgba(91,63,219,${o})`,
              boxShadow: cellShadow(i + 1),
            }}
          />
        ))}
        <span>Banyak</span>
      </div>
    </div>
  )
}