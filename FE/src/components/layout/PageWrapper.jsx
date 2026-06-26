export default function PageWrapper({ children, className = '' }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ece9ff] via-[#ddd8ff] to-[#e8e4ff] flex justify-center font-nunito">
      <div className={`w-full max-w-sm flex flex-col pb-8 ${className}`}>
        {children}
      </div>
    </div>
  )
}