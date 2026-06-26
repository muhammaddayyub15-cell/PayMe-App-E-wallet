export default function Spinner({ size = 'md' }) {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-9 h-9 border-[3px]',
    lg: 'w-12 h-12 border-4',
  }

  return (
    <div className="flex justify-center items-center py-6">
      <div className={`
        ${sizes[size] ?? sizes.md}
        rounded-full
        border-[#e0dbff]
        border-t-[#7c6af7]
        animate-spin
        clay-spinner
      `} />
    </div>
  )
}