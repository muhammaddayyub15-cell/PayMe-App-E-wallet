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

    // State
    const [method, setMethod] = useState('internal'); // 'internal' | 'qris'
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showQrisModal, setShowQrisModal] = useState(false);

    // Handlers
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
        if (validationError) {
            setError(validationError);
            return;
        }

        const numAmount = parseInt(amount, 10);

        if (method === 'qris') {
            setShowQrisModal(true);
            return;
        }

        // Internal top-up
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
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                {/* Method tabs */}
                <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
                    <MethodTab
                        id="internal"
                        label="Langsung"
                        icon="⚡"
                        active={method === 'internal'}
                        onClick={handleMethodChange}
                    />
                    <MethodTab
                        id="qris"
                        label="QRIS"
                        icon="⊟"
                        active={method === 'qris'}
                        onClick={handleMethodChange}
                    />
                </div>

                {/* Method hint */}
                <p className="text-xs text-gray-400 -mt-1">
                    {method === 'internal'
                        ? 'Saldo langsung masuk tanpa pembayaran.'
                        : 'Scan QR code dengan aplikasi m-banking atau e-wallet.'}
                </p>

                {/* Amount input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nominal Top-up
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                            Rp
                        </span>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={amount}
                            onChange={handleAmountChange}
                            placeholder="10.000 – 10.000.000"
                            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition
                                ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                        />
                    </div>
                    <ValidationMessage message={error} />
                    {amountPreview && !error && (
                        <p className="text-xs text-gray-400 mt-1">{amountPreview}</p>
                    )}
                </div>

                {/* Quick picks */}
                <div className="flex gap-2 flex-wrap">
                    {[10_000, 50_000, 100_000, 500_000].map((v) => (
                        <button
                            key={v}
                            type="button"
                            onClick={() => {
                                const str = String(v);
                                setAmount(str);
                                setError('');
                            }}
                            className="px-3 py-1 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                        >
                            {new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 0 }).format(v)}
                        </button>
                    ))}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={!isFormValid || isLoading}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600
                        hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-150"
                >
                    {isLoading
                        ? 'Memproses...'
                        : method === 'qris'
                            ? 'Tampilkan QR Code'
                            : 'Top-up Sekarang'}
                </button>
            </form>

            {/* QRIS Modal */}
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