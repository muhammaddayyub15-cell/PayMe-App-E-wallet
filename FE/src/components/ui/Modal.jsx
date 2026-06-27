export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel = 'Konfirmasi',
  isLoading = false,
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-[#5040b4]/25 flex items-center justify-center z-[998] px-5 font-nunito">
      <div className="w-full max-w-sm bg-gradient-to-br from-[#f0eeff] to-[#e8e3ff] rounded-3xl p-6 clay-modal">

        {/* Title — disembunyikan kalau kosong (pola "modal kosong", children urus semua UI) */}
        {title && <h3 className="text-base font-black text-[#3d2f8a] mb-4">{title}</h3>}

        {/* Content */}
        <div className={confirmLabel ? 'mb-6' : ''}>{children}</div>

        {/* Actions — disembunyikan kalau confirmLabel kosong, karena children
            (TopUpForm/TransferForm) sudah punya button Batal/Konfirmasi sendiri */}
        {confirmLabel && (
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 rounded-full text-sm font-black text-[#6b5fb5] border-none cursor-pointer disabled:opacity-60 active:scale-95 transition-all duration-150 hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #e8e3ff, #ddd8ff)',
                boxShadow: '4px 6px 16px rgba(107,95,181,0.2), -2px -2px 8px rgba(255,255,255,0.8), inset 2px 2px 6px rgba(255,255,255,0.9), inset -2px -2px 6px rgba(180,170,230,0.4)',
              }}
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 py-3 rounded-full text-sm font-black text-white border-none cursor-pointer disabled:opacity-60 active:scale-95 transition-all duration-150 hover:-translate-y-0.5"
              style={{
                background: '#5b3fdb',
                boxShadow: '6px 8px 20px rgba(91,63,219,0.35), -3px -3px 10px rgba(255,255,255,0.5), inset 3px 3px 8px #a090ff, inset -3px -3px 8px #3a22b8',
              }}
            >
              {isLoading ? 'Memproses...' : confirmLabel}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}