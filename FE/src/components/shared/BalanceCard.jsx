// src/components/shared/BalanceCard.jsx
import { useState } from 'react'
import { formatRupiah } from '../../utils/formatCurrency'

export default function BalanceCard({ balance, holderName, onTopUp, onTransfer }) {
  const [hidden, setHidden] = useState(false)

  return (
    <div className="mx-4 mb-5 bg-gradient-to-br from-[#8b78ff] via-[#7057f5] to-[#6347e8] rounded-[28px] p-6 relative clay-hero font-nunito">

      {/* Header row */}
      <div className="flex justify-between items-start mb-1">
        <span className="text-xs font-bold text-white/70">Total Saldo</span>
        <button
          onClick={() => setHidden(h => !h)}
          className="bg-white/20 border-none rounded-full px-3 py-1 text-[10px] font-black text-white cursor-pointer"
        >
          {hidden ? '👁 Tampilkan' : '🙈 Sembunyikan'}
        </button>
      </div>

      {/* Balance */}
      <div
        className={`text-2xl font-black text-white tracking-tight mb-1 transition-all duration-200 select-none ${hidden ? 'blur-md' : 'blur-0'}`}
      >
        {formatRupiah(balance ?? 0)}
      </div>

      {/* Holder name */}
      <div className="text-sm font-bold text-white/75 mb-5">
        {holderName}
      </div>

      {/* Quick buttons */}
      <div className="flex gap-3">
        <button
          onClick={onTopUp}
          className="flex-1 py-2.5 rounded-2xl border-none text-xs font-black text-white bg-white/20 cursor-pointer active:scale-95 transition-all duration-150"
        >
          + Top Up
        </button>
        <button
          onClick={onTransfer}
          className="flex-1 py-2.5 rounded-2xl border-none text-xs font-black text-white bg-white/20 cursor-pointer active:scale-95 transition-all duration-150"
        >
          ↗ Transfer
        </button>
      </div>

    </div>
  )
}