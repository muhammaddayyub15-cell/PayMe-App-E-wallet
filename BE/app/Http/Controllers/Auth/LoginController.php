<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Auth\AuthenticationException;
use Symfony\Component\HttpFoundation\Cookie;

class LoginController extends Controller
{
    private const ACCESS_TOKEN_TTL_MINUTES = 30;
    private const REFRESH_TOKEN_TTL_MINUTES = 60 * 24 * 7;

    public function __construct(
        private AuthService $authService
    ) {}

    /**
     * POST /api/login — lihat 04-api-documentation.md §3.2.
     * Token TIDAK dikirim di response body — hanya via Set-Cookie httpOnly.
     */
    public function __invoke(LoginRequest $request)
    {
        try {
            $result = $this->authService->login(
                $request->input('email'),
                $request->input('password'),
            );
        } catch (AuthenticationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 401);
        }

        $response = (new UserResource($result['user']))
            ->additional([
                'success' => true,
                'message' => 'Login berhasil.',
            ])
            ->response()
            ->setStatusCode(200);

        return $response
            ->withCookie($this->makeTokenCookie('access_token', $result['access_token'], self::ACCESS_TOKEN_TTL_MINUTES))
            ->withCookie($this->makeTokenCookie('refresh_token', $result['refresh_token'], self::REFRESH_TOKEN_TTL_MINUTES));
    }

    /**
     * Cookie httpOnly, secure, samesite=strict — sesuai BRD §4.1 item #07.
     *
     * Di environment local, `secure` di-set false dan `sameSite` di-set 'lax'
     * agar cookie tetap terkirim saat testing via Postman/localhost HTTP
     * (browser menolak cookie `secure=true` di koneksi non-HTTPS).
     * Production WAJIB tetap secure=true, sameSite=strict.
     */
    private function makeTokenCookie(string $name, string $value, int $minutes): Cookie
    {
        $isLocal = app()->environment('local');

        return cookie(
            name: $name,
            value: $value,
            minutes: $minutes,
            path: '/',
            domain: null,
            secure: ! $isLocal,
            httpOnly: true,
            raw: true,
            sameSite: $isLocal ? 'lax' : 'strict', // untuk production harus strict
        );
    }
}