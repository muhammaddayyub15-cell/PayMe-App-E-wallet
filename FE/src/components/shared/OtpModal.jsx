import { useState } from "react";
import { verifyOtp, sendOtp } from "../../api/otpApi";
import useToastStore from "../../stores/toastStore";

// ── OtpModal ─────────────────────────────────────────────────────────────────
// Ditampilkan oleh TransferForm ketika backend return otp_required: true
// Props:
//   onVerified  : callback setelah OTP sukses → TransferForm lanjut submit
//   onClose     : callback tutup modal (user batal)

export default function OtpModal({ onVerified, onClose }) {
    const [code, setCode]       = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState("");
    const [resending, setResending] = useState(false);

    const { addToast } = useToastStore();

    const handleVerify = async () => {
        if (code.length !== 6) {
            setError("Kode OTP harus 6 digit.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await verifyOtp(code);
            addToast("OTP terverifikasi.", "success");
            onVerified(); // beri tahu TransferForm untuk lanjut submit
        } catch (err) {
            const msg =
                err.response?.data?.errors?.code?.[0] ||
                err.response?.data?.message ||
                "Kode OTP tidak valid.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError("");
        try {
            await sendOtp();
            addToast("Kode OTP baru telah dikirim ke email kamu.", "success");
        } catch {
            addToast("Gagal mengirim ulang OTP, coba lagi.", "error");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                <h2 className="mb-1 text-lg font-semibold text-gray-800">
                    Verifikasi OTP
                </h2>
                <p className="mb-5 text-sm text-gray-500">
                    Masukkan kode 6 digit yang dikirim ke email kamu.
                </p>

                <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="______"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center
                               text-2xl font-bold tracking-widest focus:outline-none
                               focus:ring-2 focus:ring-indigo-400"
                />

                {error && (
                    <p className="mt-2 text-sm text-red-500">{error}</p>
                )}

                <button
                    onClick={handleVerify}
                    disabled={loading || code.length !== 6}
                    className="mt-4 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold
                               text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                    {loading ? "Memverifikasi..." : "Verifikasi"}
                </button>

                <div className="mt-3 flex items-center justify-between text-sm text-gray-400">
                    <button
                        onClick={handleResend}
                        disabled={resending}
                        className="hover:text-indigo-500 disabled:opacity-50"
                    >
                        {resending ? "Mengirim..." : "Kirim ulang OTP"}
                    </button>
                    <button onClick={onClose} className="hover:text-gray-600">
                        Batal
                    </button>
                </div>
            </div>
        </div>
    );
}