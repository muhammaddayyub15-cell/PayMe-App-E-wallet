import { useState } from 'react'
import TransactionItem from './TransactionItem'
import Spinner from '../ui/Spinner'

const FILTERS = [
  { label: 'Semua',  value: null },
  { label: 'Masuk',  value: 'TRANSFER_IN' },
  { label: 'Keluar', value: 'TRANSFER_OUT' },
  { label: 'Top Up', value: 'TOPUP' },
]

export default function TransactionList({ transactions, isLoading, meta, onLoadMore }) {
  const [filter, setFilter] = useState(null)

  const filtered = filter
    ? transactions.filter(tx => tx.type === filter)
    : transactions

  const hasMore = meta && meta.current_page < meta.last_page

  return (
    <div className="font-nunito">

      {/* Filter chips */}
      <div className="flex gap-2 px-4 mb-3 overflow-x-auto pb-1">
        {FILTERS.map(f => {
          const active = filter === f.value
          return (
            <button
              key={f.label}
              onClick={() => setFilter(f.value)}
              className="px-3.5 py-1.5 rounded-full text-[11px] font-black border-none cursor-pointer whitespace-nowrap transition-all duration-150 active:scale-95 hover:-translate-y-0.5"
              style={{
                background: active ? 'linear-gradient(135deg,#a898ff,#7c6af7)' : 'rgba(255,255,255,0.75)',
                color: active ? 'white' : '#6b5fb5',
                boxShadow: active
                  ? '4px 6px 16px rgba(91,63,219,0.35),-2px -2px 6px rgba(255,255,255,0.5),inset 2px 2px 5px #c0b0ff,inset -2px -2px 5px #5a3fcc'
                  : '3px 4px 10px rgba(91,63,219,0.10),-1px -1px 4px rgba(255,255,255,0.9),inset 1px 1px 4px rgba(255,255,255,0.8)',
              }}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* List */}
      <div className="px-4 flex flex-col gap-2.5">

        {/* Loading — data kosong */}
        {isLoading && !transactions.length && <Spinner />}

        {/* Empty state */}
        {!isLoading && !filtered.length && (
          <div className="clay-card bg-white/75 rounded-[22px] px-4 py-8 text-center">
            <div className="text-3xl mb-2.5">💸</div>
            <div className="text-sm font-black text-[#3d2f8a] mb-1">
              {filter ? 'Tidak ada transaksi' : 'Belum ada transaksi'}
            </div>
            <div className="text-xs font-semibold text-[#9589c8]">
              {filter ? 'Coba pilih filter lain.' : 'Mulai dengan top-up atau transfer.'}
            </div>
          </div>
        )}

        {/* Items */}
        {filtered.map(tx => <TransactionItem key={tx.id} tx={tx} />)}

        {/* Load more */}
        {hasMore && !isLoading && (
          <button
            onClick={onLoadMore}
            className="w-full py-3 rounded-2xl text-xs font-black text-[#7c6af7] bg-white/75 clay-card border-none cursor-pointer active:scale-95 transition-all duration-150"
          >
            Muat lebih banyak
          </button>
        )}

        {/* Loading more */}
        {isLoading && transactions.length > 0 && <Spinner size="sm" />}

      </div>
    </div>
  )
}