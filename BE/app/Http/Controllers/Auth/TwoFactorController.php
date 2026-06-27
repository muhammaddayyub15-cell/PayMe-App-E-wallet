<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ConfirmTotpRequest;
use App\Http\Requests\Auth\VerifyTotpRequest;
use App\Services\AuditLogService;
use App\Services\TwoFactorService;
use Illuminate\Http\Request;

class TwoFactorController extends Controller
{
    public function __construct(
        private TwoFactorService $twoFactorService,
        private AuditLogService $auditLogService,
    ) {}

    /**
     * POST /api/2fa/setup
     * Generate secret baru + QR code. TIDAK mengaktifkan 2FA — user wajib
     * confirm() dengan kode pertama dulu. Bisa dipanggil berkali-kali
     * (misal user gagal scan dan minta QR baru) — secret akan di-overwrite.
     */
    public function setup(Request $request)
    {
        $user = $request->user();

        if ($user->hasTwoFactorEnabled()) {
            return response()->json([
                'success' => false,
                'message' => '2FA sudah aktif di akun ini.',
            ], 422);
        }

        $secret = $this->twoFactorService->generateSecret($user);
        $qrCodeSvg = $this->twoFactorService->generateQrCodeSvg($user, $secret);

        return response()->json([
            'success' => true,
            'message' => 'Secret 2FA berhasil dibuat, silakan scan QR code.',
            'data' => [
                'secret' => $secret,
                'qr_code_svg' => $qrCodeSvg,
            ],
        ], 200);
    }

    /**
     * POST /api/2fa/confirm
     * Verifikasi kode pertama dari Google Authenticator -> aktifkan 2FA.
     */
    public function confirm(ConfirmTotpRequest $request)
    {
        $user = $request->user();

        if ($user->hasTwoFactorEnabled()) {
            return response()->json([
                'success' => false,
                'message' => '2FA sudah aktif di akun ini.',
            ], 422);
        }

        $isValid = $this->twoFactorService->verifyCode($user, $request->input('code'));

        if (! $isValid) {
            return response()->json([
                'success' => false,
                'message' => 'Kode tidak valid atau sudah kedaluwarsa.',
                'errors' => ['code' => ['Kode tidak valid atau sudah kedaluwarsa.']],
            ], 422);
        }

        $this->twoFactorService->confirm($user);

        $this->auditLogService->log('TWO_FACTOR_ENABLED', [], $user->id);

        return response()->json([
            'success' => true,
            'message' => '2FA berhasil diaktifkan.',
        ], 200);
    }

    /**
     * POST /api/2fa/disable
     * Matikan 2FA. Mewajibkan password ulang sebagai konfirmasi
     * (bukan hanya klik tombol) — tindakan ini menurunkan keamanan akun.
     */
    /**
     * POST /api/2fa/verify-totp
     * Verifikasi kode TOTP saat login step 2.
     * Session sudah aktif tapi user belum dianggap fully authenticated
     * sampai kode ini berhasil diverifikasi.
     */
    public function verifyLogin(VerifyTotpRequest $request)
    {
        $user = $request->user();

        if (! $this->twoFactorService->verifyCode($user, $request->input('code'))) {
            return response()->json([
                'success' => false,
                'message' => 'Kode tidak valid atau sudah kedaluwarsa.',
                'errors'  => ['code' => ['Kode tidak valid atau sudah kedaluwarsa.']],
            ], 422);
        }

        $this->auditLogService->log('TWO_FACTOR_VERIFIED', [], $user->id);

        return response()->json([
            'success' => true,
            'message' => 'Autentikasi berhasil.',
        ]);
    }

    public function disable(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'password' => ['required'],
        ]);

        if (! \Illuminate\Support\Facades\Hash::check($request->input('password'), $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password salah.',
                'errors' => ['password' => ['Password salah.']],
            ], 422);
        }

        $this->twoFactorService->disable($user);

        $this->auditLogService->log('TWO_FACTOR_DISABLED', [], $user->id);

        return response()->json([
            'success' => true,
            'message' => '2FA berhasil dimatikan.',
        ], 200);
    }
}