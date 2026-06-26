// Validasi nominal
// Dipakai di TopUpForm, TransferForm, dan client-side validation lainnya

// ── Top-Up ──────────────────────────────────
// Min: Rp 10.000 | Max: Rp 10.000.000
export function validateTopUp(value) {
  if (value === '' || value === null || value === undefined)
    return 'Nominal tidak boleh kosong.'

  if (typeof value === 'string' && /[a-zA-Z]/.test(value))
    return 'Nominal harus berupa angka.'

  if (typeof value === 'string' && /[@#$%^&*!]/.test(value))
    return 'Nominal harus berupa angka.'

  if (String(value).includes('.'))
    return 'Nominal hanya boleh bilangan bulat.'

  const num = parseInt(value, 10)

  if (isNaN(num))
    return 'Nominal harus berupa angka.'

  if (num < 0)
    return 'Nominal tidak boleh negatif.'

  if (num < 10000)
    return 'Nominal minimal Rp 10.000.'

  if (num > 10000000)
    return 'Nominal melebihi batas maksimum transaksi.'

  return null // valid
}

// ── Transfer ─────────────────────────────────
// Min: Rp 1.000 | Max: Rp 50.000.000
export function validateTransferAmount(value) {
  if (value === '' || value === null || value === undefined)
    return 'Nominal tidak boleh kosong.'

  if (typeof value === 'string' && /[a-zA-Z]/.test(value))
    return 'Nominal harus berupa angka.'

  if (typeof value === 'string' && /[@#$%^&*!]/.test(value))
    return 'Nominal harus berupa angka.'

  if (String(value).includes('.'))
    return 'Nominal hanya boleh bilangan bulat.'

  const num = parseInt(value, 10)

  if (isNaN(num))
    return 'Nominal harus berupa angka.'

  if (num < 0)
    return 'Nominal tidak boleh negatif.'

  if (num < 1000)
    return 'Nominal minimal Rp 1.000.'

  if (num > 50000000)
    return 'Nominal melebihi batas maksimum transaksi.'

  return null // valid
}

// ── Receiver identifier ──────────────────────
export function validateReceiver(value) {
  if (!value || !value.trim())
    return 'Penerima tidak boleh kosong.'

  return null // valid
}

// ── Saldo cukup ──────────────────────────────
export function validateSufficient(amount, balance) {
  if (balance === null || balance === undefined) return null
  if (parseInt(amount, 10) > balance)
    return 'Saldo tidak cukup.'
  return null
}

// ── Password complexity sesuai BRD §4.1 ─────
// Harus ada: huruf besar, huruf kecil, angka, simbol
export function validatePassword(value) {
  if (!value)
    return 'Password tidak boleh kosong.'

  if (value.length < 8)
    return 'Password minimal 8 karakter.'

  if (!/[A-Z]/.test(value))
    return 'Password harus mengandung huruf besar.'

  if (!/[a-z]/.test(value))
    return 'Password harus mengandung huruf kecil.'

  if (!/[0-9]/.test(value))
    return 'Password harus mengandung angka.'

  if (!/[@#$%^&*!_\-+=]/.test(value))
    return 'Password harus mengandung simbol (@#$%^&*!_-).'

  return null // valid
}

// ── Email format ─────────────────────────────
export function validateEmail(value) {
  if (!value) return 'Email tidak boleh kosong.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return 'Format email tidak valid.'
  return null
}

// ── Phone format ─────────────────────────────
export function validatePhone(value) {
  if (!value) return 'No. HP tidak boleh kosong.'
  if (!/^(\+62|08)\d{8,12}$/.test(value))
    return 'Format No. HP tidak valid. Contoh: 08123456789'
  return null
}