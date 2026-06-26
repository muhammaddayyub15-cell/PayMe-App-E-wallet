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

  const shadowNormal = '6px 8px 20px rgba(160,148,220,0.20),-3px -3px 10px #ffffff,inset 3px 3px 8px rgba(255,255,255,0.95),inset -3px -3px 8px rgba(160,140,220,0.22)'
  const shadowError  = '6px 8px 20px rgba(220,60,60,0.20),-3px -3px 10px #ffffff,inset 3px 3px 8px rgba(255,255,255,0.95),inset -3px -3px 8px rgba(220,60,60,0.22)'
  const shadowFocus  = '6px 8px 20px rgba(100,80,220,0.28),-3px -3px 10px #ffffff,inset 3px 3px 8px rgba(255,255,255,0.95),inset -3px -3px 8px rgba(124,106,247,0.30)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'Nunito, sans-serif' }}>

      {label && (
        <label style={{ fontSize: 11, fontWeight: 800, color: '#6b5b9e', paddingLeft: 4 }}>
          {label}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        <input
          name={name}
          type={inputType}
          inputMode={inputMode}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          autoComplete={autoComplete}
          style={{
            width: '100%',
            padding: isPassword ? '12px 44px 12px 16px' : '12px 16px',
            borderRadius: 16,
            border: 'none',
            outline: 'none',
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'Nunito, sans-serif',
            color: '#1a1060',
            background: 'rgba(240,238,255,0.6)',
            boxSizing: 'border-box',
            opacity: disabled ? 0.6 : 1,
            boxShadow: error ? shadowError : shadowNormal,
            transition: 'box-shadow 0.15s ease',
          }}
          onFocus={e => { e.currentTarget.style.boxShadow = shadowFocus }}
          onBlur={e => { e.currentTarget.style.boxShadow = error ? shadowError : shadowNormal }}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass(s => !s)}
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1,
              color: '#9589c8',
            }}
          >
            {showPass ? '🙈' : '👁'}
          </button>
        )}
      </div>

      {helper && !error && (
        <p style={{ fontSize: 10, fontWeight: 600, color: '#b0a0d8', paddingLeft: 4, margin: 0 }}>{helper}</p>
      )}

      {error && (
        <p style={{ fontSize: 10, fontWeight: 800, color: '#e03030', paddingLeft: 4, margin: 0 }}>{error}</p>
      )}

    </div>
  )
}