import useToastStore from '../../stores/toastStore'

const config = {
  success: {
    bg: 'bg-gradient-to-br from-[#d4f5e4] to-[#bbf0d4]',
    clay: 'clay-toast-success',
    text: 'text-[#166534]',
    icon: '✓',
    iconBg: 'bg-white/60',
  },
  error: {
    bg: 'bg-gradient-to-br from-[#ffd8d8] to-[#ffc0c0]',
    clay: 'clay-toast-error',
    text: 'text-[#991b1b]',
    icon: '✕',
    iconBg: 'bg-white/60',
  },
  warning: {
    bg: 'bg-gradient-to-br from-[#fff0c0] to-[#ffe8a0]',
    clay: 'clay-toast-warning',
    text: 'text-[#92400e]',
    icon: '!',
    iconBg: 'bg-white/60',
  },
}

function ToastItem({ toast, onRemove }) {
  const c = config[toast.type] ?? config.success

  return (
    <div
      onClick={() => onRemove(toast.id)}
      className={`
        flex items-center gap-3
        ${c.bg} ${c.clay}
        rounded-2xl px-4 py-3 mb-2
        cursor-pointer
        font-nunito
      `}
    >
      <span className={`
        w-6 h-6 rounded-full ${c.iconBg}
        flex items-center justify-center
        text-xs font-black ${c.text}
        flex-shrink-0
      `}>
        {c.icon}
      </span>
      <span className={`text-sm font-bold ${c.text} flex-1`}>
        {toast.message}
      </span>
    </div>
  )
}

export default function Toast() {
  const { toasts, removeToast } = useToastStore()
  if (!toasts.length) return null

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[999] w-80 max-w-[90vw]">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  )
}