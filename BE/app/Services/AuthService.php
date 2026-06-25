<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Contracts\WalletRepositoryInterface;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    /**
     * Access token hidup 30 menit, refresh token hidup 7 hari — sesuai BRD §4.1.
     * Disimpan sebagai dua httpOnly cookie terpisah, BUKAN dikirim di body response.
     */
    private const ACCESS_TOKEN_TTL_MINUTES = 30;
    private const REFRESH_TOKEN_TTL_MINUTES = 60 * 24 * 7; // 7 hari

    private const MAX_LOGIN_ATTEMPTS = 5;
    private const LOCKOUT_MINUTES = 15;

    public function __construct(
        private UserRepositoryInterface $userRepository,
        private WalletRepositoryInterface $walletRepository,
        private AuditLogService $auditLogService,
    ) {}

    /**
     * Register user baru + buat wallet saldo 0 dalam satu transaction.
     * Lihat 02-system-structure.md §4.1.
     */
    public function register(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = $this->userRepository->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'password' => Hash::make($data['password']),
                'role' => 'customer',
            ]);

            $this->walletRepository->createForUser($user);

            $this->auditLogService->log('REGISTER_SUCCESS', [
                'email' => $user->email,
            ], $user->id);

            return $user;
        });
    }

    /**
     * Verifikasi kredensial, generate access + refresh token.
     * Lockout & rate limit dicek di middleware/Request layer SEBELUM method ini dipanggil.
     *
     * @return array{user: User, access_token: string, refresh_token: string}
     * @throws \Illuminate\Auth\AuthenticationException
     */
    public function login(string $email, string $password): array
    {
        $user = $this->userRepository->findByEmail($email);

        if (! $user || ! Hash::check($password, $user->password)) {
            $this->recordFailedAttempt($email);

            $this->auditLogService->log('LOGIN_FAILED', [
                'email' => $email,
            ], $user?->id);

            throw new \Illuminate\Auth\AuthenticationException('Email atau password salah.');
        }

        $this->resetFailedAttempts($email);

        // Revoke token lama supaya tidak menumpuk di personal_access_tokens
        $user->tokens()->delete();

        $accessToken = $user->createToken(
            name: 'access_token',
            abilities: ['access'],
            expiresAt: now()->addMinutes(self::ACCESS_TOKEN_TTL_MINUTES),
        )->plainTextToken;

        $refreshToken = $user->createToken(
            name: 'refresh_token',
            abilities: ['refresh'],
            expiresAt: now()->addMinutes(self::REFRESH_TOKEN_TTL_MINUTES),
        )->plainTextToken;

        $this->auditLogService->log('LOGIN_SUCCESS', [
            'email' => $user->email,
        ], $user->id);

        return [
            'user' => $user,
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
        ];
    }

    /**
     * Revoke seluruh token milik user yang sedang login.
     */
    public function logout(User $user): void
    {
        $user->tokens()->delete();

        $this->auditLogService->log('LOGOUT', [], $user->id);
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
        $key = $this->lockoutCacheKey($email);
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