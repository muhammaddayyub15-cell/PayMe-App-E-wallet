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

        {/* Title */}
        <h3 className="text-base font-black text-[#3d2f8a] mb-4">{title}</h3>

        {/* Content */}
        <div className="mb-6">{children}</div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 rounded-2xl text-sm font-black text-[#6b5fb5] bg-gradient-to-br from-[#e8e3ff] to-[#ddd8ff] clay-btn-secondary border-none cursor-pointer disabled:opacity-60 active:scale-95 transition-all duration-150"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 rounded-2xl text-sm font-black text-white bg-gradient-to-br from-[#a898ff] to-[#7c6af7] clay-btn-primary border-none cursor-pointer disabled:opacity-60 active:scale-95 transition-all duration-150"
          >
            {isLoading ? 'Memproses...' : confirmLabel}
          </button>
        </div>

      </div>
    </div>
  )
}