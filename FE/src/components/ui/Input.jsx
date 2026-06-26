import { useState } from 'react'

export default function Input({
  label,
  name,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  helper,
  autoComplete,
  inputMode,
  disabled = false,
}) {
  const [showPass, setShowPass] = useState(false)
  const isPassword = type === 'password'
  const inputType  = isPassword ? (showPass ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-1.5 font-nunito">

      {label && (
        <label className="text-xs font-black text-[#6b5fb5] pl-1">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          name={name}
          type={inputType}
          inputMode={inputMode}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`
            w-full px-4 py-3 rounded-2xl
            text-sm font-semibold text-[#3d2f8a]
            placeholder:text-[#c4b8f0]
            bg-white/80
            outline-none border-none
            transition-all duration-150
            disabled:opacity-60
            ${isPassword ? 'pr-12' : ''}
            ${error ? 'clay-input-error' : 'clay-input focus:clay-input'}
          `}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9589c8] text-base border-none bg-transparent cursor-pointer"
          >
            {showPass ? '🙈' : '👁'}
          </button>
        )}
      </div>

      {helper && !error && (
        <p className="text-[10px] font-semibold text-[#9589c8] pl-1">{helper}</p>
      )}

      {error && (
        <p className="text-[10px] font-black text-red-500 pl-1">{error}</p>
      )}

    </div>
  )
}