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
        <p className={`text-sm font-medium ${isUrgent ? 'text-red-500' : 'text-gray-500'}`}>
            {remaining > 0 ? `Berlaku selama ${mm}:${ss}` : 'QR Code sudah kadaluarsa'}
        </p>
    );
};

const QrisStep = ({ label, icon, active, done }) => (
    <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors
            ${done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
            {done ? '✓' : icon}
        </div>
        <span className={`text-sm ${active ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{label}</span>
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
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-500">Membuat kode QRIS...</p>
                </div>
            );
        }

        if (phase === 'error') {
            return (
                <div className="flex flex-col items-center gap-4 py-10 text-center">
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                        <span className="text-red-500 text-2xl">!</span>
                    </div>
                    <p className="text-sm text-red-600">{errorMsg}</p>
                    <button
                        onClick={handleClose}
                        className="mt-2 text-sm font-medium text-blue-600 hover:underline"
                    >
                        Tutup dan coba lagi
                    </button>
                </div>
            );
        }

        if (phase === 'expired') {
            return (
                <div className="flex flex-col items-center gap-4 py-10 text-center">
                    <p className="text-sm text-gray-600">Kode QRIS sudah kadaluarsa.</p>
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
                <div className="w-full bg-gray-50 rounded-xl p-4 flex flex-col gap-3 mt-1">
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-gray-900">Top-up via QRIS</span>
                        <span className="text-xs bg-blue-50 text-blue-600 font-medium px-2 py-0.5 rounded-full">Tripay</span>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
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