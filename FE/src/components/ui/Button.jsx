const variants = {
  primary: `
  bg-gradient-to-br from-[#7c6af7] to-[#5b3fdb]
  text-white clay-btn-primary
`,
  secondary: `
    bg-gradient-to-br from-[#e8e3ff] to-[#ddd8ff]
    text-[#6b5fb5] clay-btn-secondary
  `,
  danger: `
    bg-gradient-to-br from-[#ffd8d8] to-[#fca5a5]
    text-[#991b1b] clay-btn-danger
  `,
}

export default function Button({
  children,
  onClick,
  disabled = false,
  isLoading = false,
  variant = 'primary',
  className = '',
  type = 'button',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        px-5 py-3 rounded-2xl
        text-sm font-black
        border-none outline-none cursor-pointer
        transition-all duration-150
        active:scale-95
        disabled:opacity-60 disabled:cursor-not-allowed
        font-nunito
        ${variants[variant] ?? variants.primary}
        ${className}
      `}
    >
      {isLoading ? 'Memproses...' : children}
    </button>
  )
}