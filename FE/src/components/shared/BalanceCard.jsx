import { useState } from 'react'
import { formatRupiah } from '../../utils/formatCurrency'

export default function BalanceCard({ balance, holderName, onTopUp, onTransfer }) {
  const [hidden, setHidden] = useState(false)

  return (
    <div className="mx-4 mb-5 rounded-[28px] p-6 font-nunito"
      style={{
        background: 'linear-gradient(135deg, #8b78ff 0%, #7057f5 50%, #6347e8 100%)',
        boxShadow: '12px 16px 40px rgba(91,63,219,0.40), -6px -6px 20px rgba(255,255,255,0.25), inset 6px 6px 20px #a090ff, inset -6px -6px 20px #4030b8',
      }}>

      {/* Header row */}
      <div className="flex justify-between items-start mb-1">
        <span className="text-xs font-bold text-white/70">Total Saldo</span>
        <button
          onClick={() => setHidden(h => !h)}
          className="border-none rounded-full px-3 py-1 text-[10px] font-black text-white cursor-pointer transition-all duration-150"
          style={{
            background: 'rgba(255,255,255,0.18)',
            boxShadow: '3px 4px 10px rgba(0,0,0,0.15), -2px -2px 6px rgba(255,255,255,0.20), inset 2px 2px 5px rgba(255,255,255,0.25), inset -2px -2px 5px rgba(0,0,0,0.12)',
          }}
        >
          {hidden ? '👁 Tampilkan' : '🙈 Sembunyikan'}
        </button>
      </div>

      {/* Balance */}
      <div className={`text-2xl font-black text-white tracking-tight mb-1 transition-all duration-200 select-none ${hidden ? 'blur-md' : 'blur-0'}`}>
        {formatRupiah(balance ?? 0)}
      </div>

      {/* Holder name */}
      <div className="text-sm font-bold mb-5" style={{ color: 'rgba(255,255,255,0.75)' }}>
        {holderName}
      </div>

      {/* Quick buttons */}
      <div className="flex gap-3">
        <button
          onClick={onTopUp}
          className="flex-1 py-2.5 rounded-2xl border-none text-xs font-black text-white cursor-pointer active:scale-95 transition-all duration-150"
          style={{
            background: 'rgba(255,255,255,0.18)',
            boxShadow: '4px 5px 14px rgba(0,0,0,0.18), -3px -3px 8px rgba(255,255,255,0.22), inset 3px 3px 8px rgba(255,255,255,0.28), inset -3px -3px 8px rgba(0,0,0,0.14)',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          + Top Up
        </button>
        <button
          onClick={onTransfer}
          className="flex-1 py-2.5 rounded-2xl border-none text-xs font-black text-white cursor-pointer active:scale-95 transition-all duration-150"
          style={{
            background: 'rgba(255,255,255,0.18)',
            boxShadow: '4px 5px 14px rgba(0,0,0,0.18), -3px -3px 8px rgba(255,255,255,0.22), inset 3px 3px 8px rgba(255,255,255,0.28), inset -3px -3px 8px rgba(0,0,0,0.14)',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          ↗ Transfer
        </button>
      </div>

    </div>
  )
}