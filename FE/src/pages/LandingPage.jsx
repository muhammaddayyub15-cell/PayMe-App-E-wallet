import { useNavigate } from 'react-router-dom'

// ── Clay Mascot SVG ──────────────────────────────────────────────────────────
function ClayMascot() {
  return (
    <svg viewBox="0 0 320 360" width="320" height="360" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bodyGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#c8b8ff" />
          <stop offset="100%" stopColor="#7050e8" />
        </radialGradient>
        <radialGradient id="faceGrad" cx="40%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#fff0f8" />
          <stop offset="100%" stopColor="#f0d8ff" />
        </radialGradient>
        <radialGradient id="coinGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#fff0a0" />
          <stop offset="100%" stopColor="#e0a800" />
        </radialGradient>
        <radialGradient id="cheekGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb8d0" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffb8d0" stopOpacity="0" />
        </radialGradient>
        <filter id="softBlur">
          <feGaussianBlur stdDeviation="2" />
        </filter>
        <filter id="clayShadow">
          <feDropShadow dx="4" dy="6" stdDeviation="8" floodColor="#4020a0" floodOpacity="0.28" />
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="160" cy="340" rx="80" ry="14" fill="#b0a0e0" opacity="0.28" filter="url(#softBlur)" />

      {/* Body */}
      <ellipse cx="160" cy="240" rx="88" ry="96" fill="url(#bodyGrad)" filter="url(#clayShadow)" />
      <ellipse cx="130" cy="190" rx="28" ry="18" fill="white" opacity="0.22" transform="rotate(-20,130,190)" />
      <ellipse cx="195" cy="295" rx="30" ry="20" fill="#3020a0" opacity="0.18" transform="rotate(15,195,295)" />

      {/* Left arm */}
      <ellipse cx="76" cy="250" rx="22" ry="38" fill="url(#bodyGrad)" transform="rotate(-18,76,250)" />
      <ellipse cx="64" cy="228" rx="10" ry="7" fill="white" opacity="0.20" />

      {/* Right arm */}
      <ellipse cx="244" cy="238" rx="22" ry="36" fill="url(#bodyGrad)" transform="rotate(20,244,238)" />
      <ellipse cx="248" cy="216" rx="9" ry="6" fill="white" opacity="0.20" />

      {/* Coin */}
      <circle cx="258" cy="198" r="26" fill="url(#coinGrad)" filter="url(#clayShadow)" />
      <circle cx="250" cy="191" r="12" fill="white" opacity="0.30" />
      <text x="258" y="203" textAnchor="middle" fontFamily="Nunito,sans-serif" fontWeight="900" fontSize="18" fill="#a07800">Rp</text>

      {/* Feet */}
      <ellipse cx="133" cy="328" rx="30" ry="18" fill="#6840d8" />
      <ellipse cx="187" cy="328" rx="30" ry="18" fill="#6840d8" />
      <ellipse cx="122" cy="320" rx="10" ry="6" fill="white" opacity="0.22" />
      <ellipse cx="176" cy="320" rx="10" ry="6" fill="white" opacity="0.22" />

      {/* Head */}
      <circle cx="160" cy="138" r="74" fill="url(#faceGrad)" filter="url(#clayShadow)" />
      <ellipse cx="130" cy="100" rx="26" ry="20" fill="white" opacity="0.38" transform="rotate(-25,130,100)" />
      <ellipse cx="188" cy="178" rx="24" ry="16" fill="#c0a0e0" opacity="0.25" />

      {/* Ears */}
      <circle cx="90" cy="138" r="18" fill="url(#faceGrad)" />
      <circle cx="86" cy="136" r="8" fill="#ffb8d0" opacity="0.6" />
      <circle cx="230" cy="138" r="18" fill="url(#faceGrad)" />
      <circle cx="226" cy="136" r="8" fill="#ffb8d0" opacity="0.6" />

      {/* Eyes */}
      <ellipse cx="137" cy="130" rx="16" ry="18" fill="white" />
      <circle cx="139" cy="132" r="10" fill="#1a0860" />
      <circle cx="143" cy="128" r="4" fill="white" />
      <circle cx="136" cy="126" r="2" fill="white" opacity="0.7" />

      <ellipse cx="183" cy="130" rx="16" ry="18" fill="white" />
      <circle cx="181" cy="132" r="10" fill="#1a0860" />
      <circle cx="185" cy="128" r="4" fill="white" />
      <circle cx="178" cy="126" r="2" fill="white" opacity="0.7" />

      {/* Blush */}
      <circle cx="108" cy="158" r="20" fill="url(#cheekGrad)" filter="url(#softBlur)" />
      <circle cx="212" cy="158" r="20" fill="url(#cheekGrad)" filter="url(#softBlur)" />

      {/* Smile */}
      <path d="M 138 162 Q 160 184 182 162" stroke="#c060a0" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M 141 165 Q 160 182 179 165" stroke="white" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.7" />

      {/* Brows */}
      <path d="M 124 110 Q 137 102 150 108" stroke="#6838c8" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M 170 108 Q 183 102 196 110" stroke="#6838c8" strokeWidth="3.5" fill="none" strokeLinecap="round" />

      {/* Floating stars */}
      <g opacity="0.7">
        <path d="M 48 100 l4 8 8 0 -6.5 5 2.5 8 -8 -5.5 -8 5.5 2.5-8 -6.5-5 8 0z" fill="#f0c000" transform="scale(0.7) translate(20,50)" />
        <path d="M 290 80 l3 6 6 0 -5 4 2 6 -6 -4 -6 4 2-6 -5-4 6 0z" fill="#ff90c0" transform="scale(0.8)" />
        <circle cx="60" cy="60" r="4" fill="#a090ff" opacity="0.8" />
        <circle cx="275" cy="150" r="3" fill="#90e8c0" opacity="0.8" />
        <circle cx="45" cy="200" r="5" fill="#ffc870" opacity="0.6" />
      </g>

      {/* Shield badge */}
      <g transform="translate(105, 260)">
        <path d="M 0 0 L 20 0 L 20 22 L 10 30 L 0 22 Z" fill="#38c890" opacity="0.95" />
        <text x="10" y="18" textAnchor="middle" fontFamily="Nunito" fontWeight="900" fontSize="13" fill="white">✓</text>
      </g>
    </svg>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()

  const features = [
    { icon: '⚡', color: 'purple', name: 'Transfer Instan', desc: 'Kirim uang ke siapa saja via email atau nomor HP — proses dalam hitungan detik, 24/7.' },
    { icon: '🔒', color: 'pink', name: 'Keamanan Berlapis', desc: 'Enkripsi end-to-end, idempotency key, dan audit log real-time menjaga setiap transaksimu.' },
    { icon: '📊', color: 'teal', name: 'Riwayat Lengkap', desc: 'Pantau semua mutasi masuk dan keluar dengan detail — kapan saja, dari mana saja.' },
    { icon: '🪙', color: 'blue', name: 'Top-Up Mudah', desc: 'Isi saldo via transfer langsung atau scan QRIS — sesimpel ngelihat QR code dan bayar.' },
  ]

  const testimonials = [
    { stars: 5, quote: '"Transfer ke teman udah kayak chat — cepat banget, nggak ada drama gagal transfer lagi!"', name: 'Budi Wicaksono', role: 'Freelancer, Yogyakarta', initials: 'BW', av: 'purple' },
    { stars: 5, quote: '"Suka banget sama notifikasi email-nya — langsung tahu kalau ada uang masuk. Kerasa aman!"', name: 'Sari Rahayu', role: 'Mahasiswi, Bandung', initials: 'SR', av: 'pink' },
    { stars: 5, quote: '"Top-up QRIS-nya simpel. Scan, bayar, saldo langsung masuk. Nggak perlu tunggu lama."', name: 'Andi Pratama', role: 'Wirausahawan, Surabaya', initials: 'AP', av: 'teal' },
  ]

  return (
    <div className="min-h-screen font-nunito" style={{ background: '#f0eeff', color: '#2a1e6e' }}>

      {/* NAV */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-5"
        style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(180,160,255,0.2)' }}>
        <div className="text-2xl font-black" style={{ color: '#5b3fdb', letterSpacing: '-0.5px' }}>
          Pay<span style={{ color: '#ff7eb6' }}>Me</span>
        </div>
        <button onClick={() => navigate('/login')}
          className="px-7 py-2.5 rounded-full text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
          style={{ background: '#5b3fdb', border: 'none', boxShadow: '4px 6px 16px rgba(91,63,219,0.35),-2px -2px 8px rgba(255,255,255,0.5),inset 2px 2px 6px #9c82ff,inset -2px -2px 6px #3a22b8' }}>
          Masuk
        </button>
      </nav>

      {/* HERO */}
      <section className="flex items-center justify-between max-w-5xl mx-auto px-8 pt-16 pb-12 gap-8 flex-wrap">
        <div className="flex-1 min-w-72">
          <div className="inline-block text-xs font-extrabold tracking-widest uppercase px-4 py-1 rounded-full mb-4"
            style={{ background: 'rgba(91,63,219,0.12)', color: '#5b3fdb' }}>
            🇮🇩 Dompet Digital Indonesia
          </div>
          <h1 className="font-black leading-tight mb-5" style={{ fontSize: 'clamp(32px,5vw,54px)', color: '#1a1060' }}>
            Kirim uang<br />
            semudah <span style={{ color: '#5b3fdb' }}>senyum</span>,<br />
            secepat <span style={{ color: '#e0509a' }}>kedip</span>.
          </h1>
          <p className="text-base leading-relaxed mb-8 max-w-md" style={{ color: '#6b5b9e' }}>
            PayMe — e-wallet pintar untuk transfer, top-up, dan kelola keuangan harian kamu. Aman, cepat, dan nggak ribet.
          </p>
          <div className="flex gap-4 flex-wrap items-center">
            <button onClick={() => navigate('/login')}
              className="px-9 py-3.5 rounded-full text-base font-extrabold text-white transition-transform hover:-translate-y-0.5"
              style={{ background: '#5b3fdb', border: 'none', boxShadow: '6px 8px 20px rgba(91,63,219,0.35),-3px -3px 10px rgba(255,255,255,0.5),inset 3px 3px 8px #a090ff,inset -3px -3px 8px #3a22b8' }}>
              Mulai Sekarang
            </button>
            <button onClick={() => navigate('/register')}
              className="px-7 py-3.5 rounded-full text-base font-bold transition-all duration-150"
              style={{ background: 'transparent', color: '#5b3fdb', border: '2px solid rgba(91,63,219,0.3)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,63,219,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)' }}>
              Daftar Gratis
            </button>

          </div>
          <div className="flex gap-8 mt-10">
            {[['500rb+', 'Pengguna aktif'], ['Rp 2T+', 'Transaksi diproses'], ['4.9 ⭐', 'Rating pengguna']].map(([val, lbl]) => (
              <div key={lbl}>
                <div className="text-2xl font-black" style={{ color: '#1a1060' }}>{val}</div>
                <div className="text-xs font-semibold" style={{ color: '#8878b8' }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center items-center" style={{ flex: '0 0 320px' }}>
          <ClayMascot />
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 px-8" style={{ background: 'rgba(255,255,255,0.5)' }}>
        <div className="text-xs font-extrabold tracking-widest uppercase text-center mb-1" style={{ color: '#5b3fdb' }}>Kenapa PayMe?</div>
        <h2 className="text-center font-black mb-2" style={{ fontSize: 'clamp(24px,4vw,36px)', color: '#1a1060' }}>Semua yang kamu butuhkan</h2>
        <p className="text-center text-sm mb-10" style={{ color: '#7a6aaa' }}>Satu app, banyak solusi untuk keuangan harianmu.</p>
        <div className="grid gap-6 max-w-4xl mx-auto" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          {features.map(f => (
            <div key={f.name} className="rounded-3xl p-8" style={{ background: '#fff', boxShadow: '8px 10px 26px rgba(160,148,220,0.18),-4px -4px 14px #ffffff,inset 3px 3px 10px rgba(255,255,255,0.98),inset -3px -3px 10px rgba(160,140,220,0.16)' }}>
              <div className={`feat-icon-${f.color} w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4`}
                style={iconStyle(f.color)}>
                {f.icon}
              </div>
              <div className="text-base font-extrabold mb-1" style={{ color: '#1a1060' }}>{f.name}</div>
              <div className="text-xs leading-relaxed" style={{ color: '#7a6aaa' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 px-8">
        <div className="text-xs font-extrabold tracking-widest uppercase text-center mb-1" style={{ color: '#5b3fdb' }}>Kata mereka</div>
        <h2 className="text-center font-black mb-2" style={{ fontSize: 'clamp(24px,4vw,36px)', color: '#1a1060' }}>Dipercaya ribuan pengguna</h2>
        <p className="text-center text-sm mb-10" style={{ color: '#7a6aaa' }}>Bukan cuma kami yang bilang — dengerin langsung dari penggunanya.</p>
        <div className="grid gap-6 max-w-3xl mx-auto" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
          {testimonials.map(t => (
            <div key={t.name} className="rounded-3xl p-7" style={{ background: '#fff', boxShadow: '8px 10px 26px rgba(160,148,220,0.18),-4px -4px 14px #ffffff,inset 3px 3px 10px rgba(255,255,255,0.98),inset -3px -3px 10px rgba(160,140,220,0.16)' }}>
              <div className="text-sm mb-3" style={{ color: '#f0b800' }}>{'★'.repeat(t.stars)}</div>
              <div className="text-sm italic leading-relaxed mb-5 font-semibold" style={{ color: '#4a3a8a' }}>{t.quote}</div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold text-white" style={{ background: avatarBg(t.av) }}>
                  {t.initials}
                </div>
                <div>
                  <div className="text-xs font-extrabold" style={{ color: '#1a1060' }}>{t.name}</div>
                  <div className="text-xs" style={{ color: '#9888c8' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <div className="mx-6 mb-12 rounded-3xl p-12 text-center"
        style={{ background: 'linear-gradient(135deg,#5b3fdb,#8b60ff)', boxShadow: '10px 14px 36px rgba(91,63,219,0.35),-5px -5px 16px rgba(255,255,255,0.25),inset 5px 5px 16px #a090ff,inset -5px -5px 16px #3a22b8' }}>
        <h2 className="font-black text-white mb-2" style={{ fontSize: 'clamp(22px,4vw,36px)' }}>Siap mulai? Daftar gratis sekarang.</h2>
        <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.8)' }}>Bergabung dengan 500.000+ pengguna yang sudah mempercayakan keuangan mereka ke PayMe.</p>
        <button onClick={() => navigate('/register')}
          className="px-10 py-3.5 rounded-full text-base font-extrabold transition-all duration-150"
          style={{ background: '#fff', color: '#5b3fdb', border: 'none', boxShadow: '4px 6px 16px rgba(0,0,0,0.15),inset 2px 2px 6px rgba(255,255,255,0.9),inset -2px -2px 6px rgba(91,63,219,0.1)' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '6px 10px 24px rgba(0,0,0,0.18),inset 2px 2px 6px rgba(255,255,255,0.9),inset -2px -2px 6px rgba(91,63,219,0.15)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '4px 6px 16px rgba(0,0,0,0.15),inset 2px 2px 6px rgba(255,255,255,0.9),inset -2px -2px 6px rgba(91,63,219,0.1)' }}>
          Buat Akun Gratis
        </button>
      </div>

      <footer className="text-center pb-6 text-xs" style={{ color: '#9888c8' }}>
        © 2026 PayMe — E-Wallet Indonesia. Aman &amp; Terpercaya.
      </footer>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function iconStyle(color) {
  const styles = {
    purple: { background: 'linear-gradient(135deg,#e8e0ff,#c8b8ff)', boxShadow: '4px 5px 12px rgba(140,120,220,0.28),-2px -2px 8px #fff,inset 2px 2px 6px #d8ccff,inset -2px -2px 6px #8870e8' },
    pink: { background: 'linear-gradient(135deg,#ffe0f0,#ffb8d8)', boxShadow: '4px 5px 12px rgba(210,140,170,0.28),-2px -2px 8px #fff,inset 2px 2px 6px #ffd0e8,inset -2px -2px 6px #d060a0' },
    teal: { background: 'linear-gradient(135deg,#d0fff0,#90f0d0)', boxShadow: '4px 5px 12px rgba(80,180,130,0.26),-2px -2px 8px #fff,inset 2px 2px 6px #b8fce0,inset -2px -2px 6px #38a878' },
    blue: { background: 'linear-gradient(135deg,#d8eeff,#a8d4ff)', boxShadow: '4px 5px 12px rgba(80,140,220,0.26),-2px -2px 8px #fff,inset 2px 2px 6px #c8e8ff,inset -2px -2px 6px #4890e0' },
  }
  return styles[color] || {}
}

function avatarBg(color) {
  const bgs = {
    purple: 'linear-gradient(135deg,#8060e8,#5030c0)',
    pink: 'linear-gradient(135deg,#e060a0,#c03070)',
    teal: 'linear-gradient(135deg,#30b880,#108858)',
  }
  return bgs[color] || '#888'
}