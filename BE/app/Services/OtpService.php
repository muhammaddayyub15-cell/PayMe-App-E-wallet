<?php

namespace App\Services;

use App\Models\OtpLog;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpMail;

class OtpService
{
    // Grace period: setelah verify OTP, user tidak perlu OTP lagi selama X menit
    private const GRACE_MINUTES = 10;

    // OTP berlaku 5 menit
    private const OTP_TTL_MINUTES = 5;

    /**
     * Generate kode OTP 6 digit, simpan ke otp_logs, kirim ke email user.
     * Invalidate OTP lama (belum dipakai) sebelum buat yang baru.
     */
    public function send(User $user, string $type = 'TRANSFER_OTP'): void
    {
        // Invalidate semua OTP lama yang belum dipakai untuk user + type ini
        OtpLog::where('user_id', $user->id)
            ->where('type', $type)
            ->whereNull('used_at')
            ->update(['used_at' => now()]);

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        OtpLog::create([
            'user_id'    => $user->id,
            'type'       => $type,
            'code'       => $code,
            'expires_at' => now()->addMinutes(self::OTP_TTL_MINUTES),
        ]);

        Mail::to($user->email)->send(new OtpMail($user, $code));
    }

    /**
     * Verifikasi kode OTP. Jika valid:
     * - tandai used_at
     * - set grace period di Redis
     * Return true jika valid, false jika tidak.
     */
    public function verify(User $user, string $code, string $type = 'TRANSFER_OTP'): bool
    {
        $otp = OtpLog::where('user_id', $user->id)
            ->where('type', $type)
            ->where('code', $code)
            ->whereNull('used_at')
            ->latest()
            ->first();

        if (! $otp || ! $otp->isValid()) {
            return false;
        }

        // Tandai terpakai
        $otp->update(['used_at' => now()]);

        return true;
    }
}