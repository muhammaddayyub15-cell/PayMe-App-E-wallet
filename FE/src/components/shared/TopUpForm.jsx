// ── Imports
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useWallet from '../../hooks/useWallet';
import QrisModal from './QrisModal';

// ── Sub-components

const MethodTab = ({ id, label, icon, active, onClick }) => (
    <button
        type="button"
        onClick={() => onClick(id)}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all
            ${active
                ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                : 'text-gray-500 hover:text-gray-700'
            }`}
    >
        <span className="text-base">{icon}</span>
        {label}
    </button>
);

const ValidationMessage = ({ message, type = 'error' }) => {
    if (!message) return null;
    const styles = type === 'error' ? 'text-red-500' : 'text-green-600';
    return <p className={`text-xs mt-1 ${styles}`}>{message}</p>;
};

// ── Main Component

const TopUpForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const { topUp } = useWallet();

    const [method, setMethod] = useState('internal');
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showQrisModal, setShowQrisModal] = useState(false);

    const validateAmount = (val) => {
        const raw = val.trim();
        if (raw === '') return 'Nominal tidak boleh kosong.';
        if (!/^\d+$/.test(raw)) return 'Nominal harus berupa angka.';
        const num = parseInt(raw, 10);
        if (num < 0) return 'Nominal tidak boleh negatif.';
        if (num < 10_000) return 'Nominal minimum Rp 10.000.';
        if (num > 10_000_000) return 'Nominal melebihi batas maksimum transaksi.';
        return '';
    };

    const handleAmountChange = (e) => {
        const val = e.target.value;
        setAmount(val);
        if (error) setError(validateAmount(val));
    };

    const handleMethodChange = (m) => {
        setMethod(m);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validateAmount(amount);
        if (validationError) { setError(validationError); return; }
        const numAmount = parseInt(amount, 10);
        if (method === 'qris') { setShowQrisModal(true); return; }
        setIsLoading(true);
        setError('');
        try {
            await topUp(numAmount);
            setAmount('');
            onSuccess?.();
        } catch (err) {
            setError(err?.response?.data?.message || 'Gagal melakukan top-up.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleQrisSuccess = () => {
        setShowQrisModal(false);
        setAmount('');
        onSuccess?.();
    };

    const isFormValid = validateAmount(amount) === '';
    const amountNum = parseInt(amount, 10) || 0;
    const amountPreview = amountNum > 0
        ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amountNum)
        : null;

    return (
        <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-nunito" noValidate>

                {/* Method tabs */}
                <div className="clay-card bg-white/60 p-1.5 rounded-2xl flex gap-1.5">
                    <MethodTab id="internal" label="Langsung" icon="⚡" active={method === 'internal'} onClick={handleMethodChange} />
                    <MethodTab id="qris"     label="QRIS"     icon="⊟" active={method === 'qris'}     onClick={handleMethodChange} />
                </div>

                {/* Method hint */}
                <p className="text-xs font-semibold -mt-1" style={{ color: '#9888c8' }}>
                    {method === 'internal'
                        ? 'Saldo langsung masuk tanpa pembayaran.'
                        : 'Scan QR code dengan aplikasi m-banking atau e-wallet.'}
                </p>

                {/* Amount input */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black pl-1" style={{ color: '#6b5b9e' }}>
                        Nominal Top-up
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black" style={{ color: '#9888c8' }}>
                            Rp
                        </span>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={amount}
                            onChange={handleAmountChange}
                            placeholder="10.000 – 10.000.000"
                            style={{ color: '#1a1060', background: 'rgba(240,238,255,0.6)' }}
                            className={`
                                w-full pl-10 pr-4 py-3 rounded-2xl
                                text-sm font-semibold
                                placeholder:text-[#c4b8f0]
                                outline-none border-none
                                transition-all duration-150
                                ${error ? 'clay-input-error' : 'clay-input'}
                            `}
                        />
                    </div>
                    {error && <p className="text-[10px] font-black text-red-500 pl-1">{error}</p>}
                    {amountPreview && !error && (
                        <p className="text-[10px] font-semibold pl-1" style={{ color: '#9888c8' }}>{amountPreview}</p>
                    )}
                </div>

                {/* Quick picks */}
                <div className="flex gap-2 flex-wrap">
                    {[10_000, 50_000, 100_000, 500_000].map((v) => {
                        const isActive = parseInt(amount, 10) === v;
                        return (
                            <button
                                key={v}
                                type="button"
                                onClick={() => { setAmount(String(v)); setError(''); }}
                                className={`
                                    px-3.5 py-1.5 rounded-full text-[11px] font-black
                                    border-none cursor-pointer
                                    transition-all duration-150 active:scale-95
                                    ${isActive
                                        ? 'text-white clay-chip-active'
                                        : 'text-[#6b5fb5] clay-chip-inactive bg-white/75'
                                    }
                                `}
                                style={isActive ? { background: 'linear-gradient(135deg,#a898ff,#7c6af7)' } : {}}
                            >
                                {new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 0 }).format(v)}
                            </button>
                        );
                    })}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={!isFormValid || isLoading}
                    className="w-full py-3.5 rounded-full text-sm font-black text-white border-none cursor-pointer transition-all duration-150 hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                        background: '#5b3fdb',
                        boxShadow: '6px 8px 20px rgba(91,63,219,0.35),-3px -3px 10px rgba(255,255,255,0.5),inset 3px 3px 8px #a090ff,inset -3px -3px 8px #3a22b8',
                    }}
                >
                    {isLoading ? 'Memproses...' : method === 'qris' ? 'Tampilkan QR Code' : 'Top-up Sekarang'}
                </button>

            </form>

            {showQrisModal && (
                <QrisModal
                    amount={parseInt(amount, 10)}
                    onClose={() => setShowQrisModal(false)}
                    onSuccess={handleQrisSuccess}
                />
            )}
        </>
    );
};

export default TopUpForm;