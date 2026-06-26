const variants = {
  TOPUP: {
    label: 'Top Up',
    bg: 'bg-gradient-to-br from-[#c8e4ff] to-[#93c5fd]',
    text: 'text-[#1e40af]',
  },
  TRANSFER_IN: {
    label: 'Masuk',
    bg: 'bg-gradient-to-br from-[#90f0c8] to-[#6ee7b7]',
    text: 'text-[#065f46]',
  },
  TRANSFER_OUT: {
    label: 'Keluar',
    bg: 'bg-gradient-to-br from-[#ffb8b8] to-[#fca5a5]',
    text: 'text-[#991b1b]',
  },
  ADJUSTMENT: {
    label: 'Adjustment',
    bg: 'bg-gradient-to-br from-[#fff0c0] to-[#fde68a]',
    text: 'text-[#92400e]',
  },
}

export default function Badge({ type }) {
  const v = variants[type] ?? variants.ADJUSTMENT

  return (
    <span className={`
      inline-block px-2.5 py-0.5
      rounded-full text-[10px] font-black
      ${v.bg} ${v.text}
      clay-badge
    `}>
      {v.label}
    </span>
  )
}