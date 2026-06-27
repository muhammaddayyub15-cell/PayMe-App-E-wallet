<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Contracts\WalletRepositoryInterface;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    // Session lifetime dikontrol via SESSION_LIFETIME di .env (default 120 menit).
    // Tidak ada access/refresh token manual — Sanctum SPA session handle otomatis.

    private const MAX_LOGIN_ATTEMPTS = 5;
    private const LOCKOUT_MINUTES = 15;

    public function __construct(
        private UserRepositoryInterface $userRepository,
        private WalletRepositoryInterface $walletRepository,
        private AuditLogService $auditLogService,
        private TwoFactorService $twoFactorService,
    ) {}

    /**
     * Register user baru + buat wallet saldo 0 dalam satu transaction.
     */
    public function register(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = $this->userRepository->create([
                'name'     => $data['name'],
                'email'    => $data['email'],
                'phone'    => $data['phone'],
                'password' => Hash::make($data['password']),
                'role'     => 'customer',
            ]);

            $this->walletRepository->createForUser($user);

            $this->auditLogService->log('REGISTER_SUCCESS', [
                'email' => $user->email,
            ], $user->id);

            return $user;
        });
    }

    /**
     * Verifikasi kredensial, login via Sanctum SPA session.
     * Lockout & suspension dicek di CheckAccountLockout middleware SEBELUM method ini dipanggil.
     *
     * Jika user punya 2FA aktif:
     *   - $totpCode tidak dikirim / kosong  -> return ['requires_2fa' => true], TIDAK login
     *   - $totpCode dikirim tapi salah      -> throw AuthenticationException
     *   - $totpCode dikirim dan benar       -> lanjut login seperti biasa
     *
     * Session/cookie HANYA di-set Sanctum setelah kedua faktor (password + TOTP,
     * kalau aktif) lolos — bukan setelah password saja.
     *
     * @return array{user: User, requires_2fa?: bool}
     * @throws \Illuminate\Auth\AuthenticationException
     */
    public function login(string $email, string $password, ?string $totpCode = null): array
    {
        $user = $this->userRepository->findByEmail($email);

        if (! $user || ! Hash::check($password, $user->password)) {
            $this->recordFailedAttempt($email);

            $this->auditLogService->log('LOGIN_FAILED', [
                'email' => $email,
            ], $user?->id);

            throw new \Illuminate\Auth\AuthenticationException('Email atau password salah.');
        }

        // ── Step 2FA — password sudah benar, cek apakah TOTP diperlukan ──
        if ($user->hasTwoFactorEnabled()) {
            if (! $totpCode) {
                // Password benar tapi belum kirim kode TOTP.
                // BELUM Auth::login() — sesi belum aktif, hanya sinyal ke FE
                // untuk menampilkan step input kode.
                return ['user' => $user, 'requires_2fa' => true];
            }

            if (! $this->twoFactorService->verifyCode($user, $totpCode)) {
                $this->recordFailedAttempt($email);

                $this->auditLogService->log('LOGIN_FAILED', [
                    'email' => $email,
                    'reason' => 'invalid_totp',
                ], $user->id);

                throw new \Illuminate\Auth\AuthenticationException('Kode 2FA tidak valid.');
            }
        }

        $this->resetFailedAttempts($email);

        Auth::login($user);
        request()->session()->regenerate();

        $this->auditLogService->log('LOGIN_SUCCESS', [
            'email' => $user->email,
        ], $user->id);

        return ['user' => $user];
    }

    /**
     * Logout via Sanctum SPA session — invalidate session + clear cookie.
     */
    public function logout(User $user): void
    {
        $this->auditLogService->log('LOGOUT', [], $user->id);

        Auth::logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();
    }

    /**
     * Cek apakah akun sedang lockout (dipanggil dari CheckAccountLockout middleware).
     */
    public function isLockedOut(string $email): bool
    {
        return (int) Cache::get($this->lockoutCacheKey($email), 0) >= self::MAX_LOGIN_ATTEMPTS;
    }

    private function recordFailedAttempt(string $email): void
    {
        $key      = $this->lockoutCacheKey($email);
        $attempts = (int) Cache::get($key, 0) + 1;

        Cache::put($key, $attempts, now()->addMinutes(self::LOCKOUT_MINUTES));
    }

    private function resetFailedAttempts(string $email): void
    {
        Cache::forget($this->lockoutCacheKey($email));
    }

    private function lockoutCacheKey(string $email): string
    {
        return "failed_attempts:{$email}";
    }
}