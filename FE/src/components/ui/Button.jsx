const variantStyle = {
  primary: {
    background: 'linear-gradient(135deg, #7c5ff5, #5b3fdb)',
    color: '#ffffff',
    border: 'none',
    boxShadow: '6px 8px 20px rgba(91,63,219,0.35),-3px -3px 10px rgba(255,255,255,0.5),inset 3px 3px 8px #a090ff,inset -3px -3px 8px #3a22b8',
  },
  secondary: {
    background: 'transparent',
    color: '#5b3fdb',
    border: '2px solid rgba(91,63,219,0.3)',
    boxShadow: 'none',
  },
  danger: {
    background: 'linear-gradient(135deg, #ffd8d8, #fca5a5)',
    color: '#991b1b',
    border: 'none',
    boxShadow: '6px 8px 18px rgba(220,100,100,0.26),-3px -3px 10px #ffffff,inset 3px 3px 8px #ffe8e8,inset -3px -3px 8px #d04040',
  },
}

const variantDisabledStyle = {
  primary: {
    background: 'linear-gradient(135deg, #b8aee8, #9b8fd4)',
    color: '#ffffff',
    border: 'none',
    boxShadow: '6px 8px 20px rgba(91,63,219,0.25),-3px -3px 10px rgba(255,255,255,0.7),inset 3px 3px 8px #ccc4f0,inset -3px -3px 8px #8070b8',
  },
  secondary: {
    background: 'transparent',
    color: '#b0a8d8',
    border: '2px solid rgba(91,63,219,0.15)',
    boxShadow: 'none',
  },
  danger: {
    background: 'linear-gradient(135deg, #f5d8d8, #e8c0c0)',
    color: '#c09090',
    border: 'none',
    boxShadow: '6px 8px 18px rgba(220,100,100,0.15),-3px -3px 10px #ffffff,inset 3px 3px 8px #fce8e8,inset -3px -3px 8px #c8a0a0',
  },
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
  const isInactive = disabled || isLoading
  const style = isInactive
    ? (variantDisabledStyle[variant] ?? variantDisabledStyle.primary)
    : (variantStyle[variant] ?? variantStyle.primary)

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      style={style}
      onMouseEnter={e => {
        if (!isInactive) {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '8px 10px 24px rgba(91,63,219,0.45),-3px -3px 10px rgba(255,255,255,0.5),inset 3px 3px 8px #a090ff,inset -3px -3px 8px #3a22b8'
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = style.boxShadow ?? 'none'
      }}
      onMouseDown={e => { if (!isInactive) e.currentTarget.style.transform = 'scale(0.97)' }}
      onMouseUp={e => { if (!isInactive) e.currentTarget.style.transform = 'translateY(-2px)' }}
      className={`
        px-7 py-3.5 rounded-full
        text-sm font-black
        outline-none cursor-pointer
        transition-all duration-150
        active:scale-95
        disabled:cursor-not-allowed
        font-nunito
        ${className}
      `}
    >
      {isLoading ? 'Memproses...' : children}
    </button>
  )
}