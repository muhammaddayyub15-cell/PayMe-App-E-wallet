// Format integer rupiah → "Rp 32.850.000"
export function formatRupiah(amount) {
  if (amount === null || amount === undefined) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format singkat → "Rp 8,5Jt" / "Rp 250Rb"
export function formatRupiahShort(amount) {
  if (!amount) return 'Rp 0'
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1).replace('.', ',')}Jt`
  if (amount >= 1_000)     return `Rp ${(amount / 1_000).toFixed(0)}Rb`
  return `Rp ${amount}`
}

// Relative time → "2 jam lalu" / "3 hari lalu"
export function relativeTime(dateString) {
  const diff = Math.floor((Date.now() - new Date(dateString)) / 1000)
  if (diff < 60)         return 'Baru saja'
  if (diff < 3600)       return `${Math.floor(diff / 60)} menit lalu`
  if (diff < 86400)      return `${Math.floor(diff / 3600)} jam lalu`
  if (diff < 2592000)    return `${Math.floor(diff / 86400)} hari lalu`
  return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}