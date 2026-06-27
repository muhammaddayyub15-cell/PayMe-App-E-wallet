<?php

namespace App\Services;

use App\Models\User;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorService
{
    private Google2FA $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    /**
     * Generate secret baru untuk user dan simpan ke kolom two_factor_secret.
     * BELUM mengaktifkan 2FA — two_factor_confirmed_at tetap null sampai
     * confirm() dipanggil dengan kode yang valid. Ini mencegah user terkunci
     * dari akun sendiri kalau gagal scan QR / salah catat secret.
     */
    
    public function generateSecret(User $user): string
    {
        $secret = $this->google2fa->generateSecretKey();

        // Pakai $user->save() agar cast 'encrypted' di User.php aktif
        $user->two_factor_secret = $secret;
        $user->save();

        return $secret;
    }

    /**
     * Render QR code sebagai SVG string, siap dikirim ke frontend.
     * Frontend hanya menerima SVG yang sudah jadi — tidak ada logic
     * encoding/decoding TOTP apapun di sisi client.
     */
    public function generateQrCodeSvg(User $user, string $secret): string
    {
        $qrCodeUrl = $this->google2fa->getQRCodeUrl(
            config('app.name', 'PayMe'),
            $user->email,
            $secret,
        );

        $renderer = new ImageRenderer(
            new RendererStyle(200),
            new SvgImageBackEnd(),
        );
        $writer = new Writer($renderer);

        return $writer->writeString($qrCodeUrl);
    }

    /**
     * Verifikasi kode 6 digit terhadap secret yang TERSIMPAN (sudah confirmed
     * ATAU masih pending confirm). Dipakai oleh:
     *  - TwoFactorController::confirm()  -> secret dari kolom (belum confirmed)
     *  - AuthService::login()            -> secret dari kolom (sudah confirmed)
     */
    public function verifyCode(User $user, string $code): bool
    {
        if (! $user->two_factor_secret) {
            return false;
        }

        // window: 2 = toleransi ±2 interval (±60 detik) untuk clock skew
        return $this->google2fa->verifyKey($user->two_factor_secret, $code, 2);
    }

    /**
     * Aktifkan 2FA setelah kode pertama berhasil diverifikasi.
     * two_factor_confirmed_at diisi -> dari titik ini login akan minta kode TOTP.
     */
    public function confirm(User $user): void
    {
        $user->two_factor_confirmed_at = now();
        $user->save();
    }

    /**
     * Matikan 2FA — hapus secret sepenuhnya (bukan hanya unset confirmed_at)
     * supaya kalau user aktifkan lagi nanti, wajib scan QR baru (secret lama
     * dianggap kompromis begitu dimatikan).
     */
    public function disable(User $user): void
    {
        $user->two_factor_secret        = null;
        $user->two_factor_confirmed_at  = null;
        $user->save();
    }
}