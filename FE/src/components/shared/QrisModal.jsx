// ── Imports
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createQrisCharge } from '../../api/walletApi';
import useWallet from '../../hooks/useWallet';

// ── Sub-components

const QrisCountdown = ({ expiresAt, onExpire }) => {
    const [remaining, setRemaining] = useState(0);

    useEffect(() => {
        if (!expiresAt) return;
        const tick = () => {
            const diff = Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000));
            setRemaining(diff);
            if (diff === 0) onExpire?.();
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [expiresAt, onExpire]);

    const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
    const ss = String(remaining % 60).padStart(2, '0');
    const isUrgent = remaining > 0 && remaining <= 60;

    return (
        <p className="text-xs font-black" style={{ color: isUrgent ? '#e03060' : '#9888c8' }}>
            {remaining > 0 ? `Berlaku selama ${mm}:${ss}` : 'QR Code sudah kadaluarsa'}
        </p>
    );
};

const QrisStep = ({ label, icon, done }) => (
    <div className="flex items-center gap-2.5">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 transition-colors ${
            done
                ? 'text-white clay-icon-green'
                : 'clay-chip-inactive text-[#6b5fb5]'
            }`}
            style={done
                ? { background: 'linear-gradient(135deg,#90f0c8,#6ee7b7)' }
                : { background: 'rgba(255,255,255,0.75)' }
            }
        >
            {done ? '✓' : icon}
        </div>
        <span className="text-xs font-semibold" style={{ color: '#4a3a8a' }}>{label}</span>
    </div>
);

// ── Main Component

const QrisModal = ({ amount, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const { refreshBalance } = useWallet();

    // State
    const [phase, setPhase] = useState('loading'); // loading | ready | expired | error
    const [qrData, setQrData] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const pollRef = useRef(null);

    // Fetch QR code on mount
    useEffect(() => {
        const fetchCharge = async () => {
            try {
                const res = await createQrisCharge(amount);
                setQrData(res.data);
                setPhase('ready');
            } catch (err) {
                setErrorMsg(err?.response?.data?.message || 'Gagal membuat kode QRIS.');
                setPhase('error');
            }
        };

        fetchCharge();
    }, [amount]);

    // Poll status setiap 5 detik saat QR sudah tampil
    useEffect(() => {
        if (phase !== 'ready' || !qrData?.merchant_ref) return;

        // Catatan: polling endpoint status bisa ditambahkan saat backend Phase 2 aktif.
        // Untuk sekarang, webhook Tripay akan trigger refresh otomatis.
        // Placeholder polling disiapkan di sini untuk koneksi mudah nanti.
        pollRef.current = setInterval(async () => {
            // TODO: GET /api/topup/status/{merchant_ref}
            // if paid: onSuccess(), refreshBalance(), clearInterval(pollRef.current)
        }, 5000);

        return () => clearInterval(pollRef.current);
    }, [phase, qrData]);

    const handleExpire = () => {
        clearInterval(pollRef.current);
        setPhase('expired');
    };

    const handleClose = () => {
        clearInterval(pollRef.current);
        onClose();
    };

    const amountFormatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);

    // Render states
    const renderContent = () => {
        if (phase === 'loading') {
            return (
                <div className="flex flex-col items-center gap-4 py-10">
                    <div className="w-10 h-10 rounded-full animate-spin clay-spinner"
                        style={{ border: '3px solid #e0dbff', borderTopColor: '#7c6af7' }} />
                    <p className="text-sm font-semibold" style={{ color: '#9888c8' }}>Membuat kode QRIS...</p>
                </div>
            );
        }

        if (phase === 'error') {
            return (
                <div className="flex flex-col items-center gap-4 py-10 text-center">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center clay-icon-red"
                        style={{ background: 'linear-gradient(135deg,#ffb8b8,#fca5a5)' }}>
                        <span className="text-lg font-black text-red-700">!</span>
                    </div>
                    <p className="text-sm font-bold" style={{ color: '#c03030' }}>{errorMsg}</p>
                    <button
                        onClick={handleClose}
                        className="px-5 py-2 rounded-full text-xs font-black border-none cursor-pointer active:scale-95 transition-all clay-chip-inactive"
                        style={{ background: 'rgba(255,255,255,0.75)', color: '#5b3fdb' }}
                    >
                        Tutup dan coba lagi
                    </button>
                </div>
            );
        }

        if (phase === 'expired') {
            return (
                <div className="flex flex-col items-center gap-4 py-10 text-center">
                    <p className="text-sm font-bold" style={{ color: '#6b5b9e' }}>Kode QRIS sudah kadaluarsa.</p>
                    <button
                        onClick={handleClose}
                        className="px-6 py-3 rounded-full text-sm font-black text-white border-none cursor-pointer active:scale-95 transition-all hover:-translate-y-0.5"
                        style={{
                            background: '#5b3fdb',
                            boxShadow: '6px 8px 20px rgba(91,63,219,0.35),-3px -3px 10px rgba(255,255,255,0.5),inset 3px 3px 8px #a090ff,inset -3px -3px 8px #3a22b8',
                        }}
                    >
                        Buat QR baru
                    </button>
                </div>
            );
        }

        // phase === 'ready'
        return (
            <div className="flex flex-col items-center gap-4">
                {/* QR Image */}
                <div className="p-3 bg-white border border-gray-200 rounded-xl">
                    {qrData?.qr_url ? (
                        <img
                            src={qrData.qr_url}
                            alt="QRIS Code"
                            className="w-52 h-52 object-contain"
                        />
                    ) : (
                        <div className="w-52 h-52 bg-gray-100 rounded-lg flex items-center justify-center">
                            <p className="text-xs text-gray-400 text-center px-4">QR Code akan tampil di sini</p>
                        </div>
                    )}
                </div>

                {/* Amount */}
                <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Nominal</p>
                    <p className="text-2xl font-semibold text-gray-900">{amountFormatted}</p>
                </div>

                {/* Countdown */}
                <QrisCountdown
                    expiresAt={qrData?.expired_time ? new Date(qrData.expired_time * 1000) : null}
                    onExpire={handleExpire}
                />

                {/* Steps */}
                <div className="w-full rounded-2xl p-4 flex flex-col gap-3 mt-1 clay-card" style={{ background: 'rgba(255,255,255,0.6)' }}>
                    <QrisStep icon="1" label="Buka aplikasi m-banking atau e-wallet" active done={false} />
                    <QrisStep icon="2" label="Pilih menu Scan QR / QRIS" active done={false} />
                    <QrisStep icon="3" label="Arahkan kamera ke kode di atas" active done={false} />
                    <QrisStep icon="4" label="Konfirmasi pembayaran" active done={false} />
                </div>

                {/* Merchant ref */}
                {qrData?.merchant_ref && (
                    <p className="text-xs text-gray-400">
                        Ref: <span className="font-mono">{qrData.merchant_ref}</span>
                    </p>
                )}
            </div>
        );
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4 font-nunito"
            style={{ background: 'rgba(80,64,180,0.25)' }}
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div className="clay-modal w-full max-w-sm rounded-3xl overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#f0eeff,#e8e3ff)' }}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4"
                    style={{ borderBottom: '1px solid rgba(160,140,220,0.15)' }}>
                    <div className="flex items-center gap-2">
                        <span className="text-base font-black" style={{ color: '#1a1060' }}>Top-up via QRIS</span>
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full clay-badge"
                            style={{ background: 'rgba(91,63,219,0.1)', color: '#5b3fdb' }}>
                            Tripay
                        </span>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border-none cursor-pointer transition-all active:scale-95 clay-chip-inactive"
                        style={{ background: 'rgba(255,255,255,0.7)', color: '#6b5b9e' }}
                        aria-label="Tutup"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 py-5">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default QrisModal;