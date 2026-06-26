<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Cookie;

/**
 * POST /api/refresh
 *
 * Membaca refresh_token dari httpOnly cookie (BUKAN dari header — refresh_token
 * tidak pernah lewat EnsureTokenFromCookie, karena middleware itu hanya
 * menyuntikkan access_token). Kalau valid, terbitkan access_token baru
 * dan set ulang cookie access_token.
 *
 * Ini bukan route ber-auth:sanctum biasa — validasi token dilakukan manual
 * di sini karena kita perlu cek ability 'refresh' secara spesifik, bukan
 * 'access'.
 */
class RefreshTokenController extends Controller
{
    private const ACCESS_TOKEN_TTL_MINUTES = 30;

    public function __construct(
        private AuthService $authService
    ) {}

    public function __invoke(Request $request)
    {
        $plainToken = $request->cookie('refresh_token');

        if (! $plainToken) {
            return response()->json([
                'success' => false,
                'message' => 'Refresh token tidak ditemukan.',
            ], 401);
        }

        $token = PersonalAccessToken::findToken($plainToken);

        if (! $token || ! $token->can('refresh') || $this->isExpired($token)) {
            return response()->json([
                'success' => false,
                'message' => 'Refresh token tidak valid atau sudah kedaluwarsa.',
            ], 401);
        }

        $user = $token->tokenable;

        $result = $this->authService->refreshAccessToken($user);

        return response()
            ->json([
                'success' => true,
                'message' => 'Token berhasil diperbarui.',
            ])
            ->withCookie($this->makeAccessTokenCookie($result['access_token']));
    }

    private function isExpired(PersonalAccessToken $token): bool
    {
        return $token->expires_at !== null && $token->expires_at->isPast();
    }

    /**
     * Sama persis dengan cookie config di LoginController — harus konsisten
     * supaya browser memperlakukan cookie ini sebagai pengganti yang sah.
     */
    private function makeAccessTokenCookie(string $value): Cookie
    {
        $isLocal = app()->environment('local');

        return cookie(
            name: 'access_token',
            value: $value,
            minutes: self::ACCESS_TOKEN_TTL_MINUTES,
            path: '/',
            domain: null,
            secure: ! $isLocal,
            httpOnly: true,
            raw: true,
            sameSite: $isLocal ? 'lax' : 'strict',
        );
    }
}