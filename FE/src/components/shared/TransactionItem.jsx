import Badge from '../ui/Badge'
import { formatRupiah, relativeTime } from '../../utils/formatCurrency'

const iconConfig = {
  TOPUP: {
    bg: 'bg-gradient-to-br from-[#b0d8ff] to-[#93c5fd]',
    clay: 'clay-icon-blue-sm',
    symbol: '⬆',
    color: 'text-[#3b82f6]',
    amtColor: 'text-[#3b82f6]',
    prefix: '+',
  },
  TRANSFER_IN: {
    bg: 'bg-gradient-to-br from-[#90f0c8] to-[#6ee7b7]',
    clay: 'clay-icon-green',
    symbol: '↙',
    color: 'text-[#10b981]',
    amtColor: 'text-[#10b981]',
    prefix: '+',
  },
  TRANSFER_OUT: {
    bg: 'bg-gradient-to-br from-[#ffb8b8] to-[#fca5a5]',
    clay: 'clay-icon-red',
    symbol: '↗',
    color: 'text-[#ef4444]',
    amtColor: 'text-[#ef4444]',
    prefix: '-',
  },
  ADJUSTMENT: {
    bg: 'bg-gradient-to-br from-[#fff0c0] to-[#fde68a]',
    clay: 'clay-icon-blue-sm',
    symbol: '⚙',
    color: 'text-[#d97706]',
    amtColor: 'text-[#d97706]',
    prefix: '',
  },
}

export default function TransactionItem({ tx }) {
  const ic = iconConfig[tx.type] ?? iconConfig.ADJUSTMENT

  return (
    <div className="flex items-center gap-3 bg-white/75 px-4 py-3.5 rounded-[22px] clay-card font-nunito">

      {/* Icon */}
      <div className={`w-11 h-11 rounded-2xl flex-shrink-0 flex items-center justify-center ${ic.bg}`}
        style={{ boxShadow: '4px 6px 14px rgba(0,0,0,0.10),-2px -2px 6px rgba(255,255,255,0.8),inset 2px 2px 5px rgba(255,255,255,0.5),inset -2px -2px 5px rgba(0,0,0,0.06)' }}>
        <span className={`text-base font-black ${ic.color}`}>{ic.symbol}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-black text-[#3d2f8a] truncate">
          {tx.counterparty ?? 'Top-Up Saldo'}
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <Badge type={tx.type} />
          <span className="text-[10px] text-[#9589c8]">
            {relativeTime(tx.created_at)}
          </span>
        </div>
      </div>

      {/* Amount */}
      <div className={`text-sm font-black whitespace-nowrap ${ic.amtColor}`}>
        {ic.prefix}{formatRupiah(tx.amount)}
      </div>

    </div>
  )
}