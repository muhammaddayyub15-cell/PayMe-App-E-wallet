<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * PENTING — INI BUKAN PERILAKU SANCTUM BAWAAN.
 *
 * Secara default, middleware `auth:sanctum` membaca token dari header
 * `Authorization: Bearer {token}`. Karena BRD mewajibkan token disimpan
 * di httpOnly cookie (bukan localStorage/header), middleware ini membaca
 * cookie `access_token` dan menyuntikkannya sebagai header Authorization
 * SEBELUM request diteruskan ke `auth:sanctum`.
 *
 * Wajib didaftarkan SEBELUM `auth:sanctum` di route group — lihat routes/api.php.
 */
class EnsureTokenFromCookie
{
    public function handle(Request $request, Closure $next): Response
    {
        $cookieValue = $request->cookie('access_token');

        \Illuminate\Support\Facades\Log::debug('EnsureTokenFromCookie', [
            'has_bearer'   => (bool) $request->bearerToken(),
            'has_cookie'   => (bool) $cookieValue,
            'cookie_value' => $cookieValue ? substr($cookieValue, 0, 20) . '...' : null,
            'all_cookies'  => array_keys($request->cookies->all()),
        ]);

        if (! $request->bearerToken() && $cookieValue) {
            $request->headers->set('Authorization', 'Bearer ' . $cookieValue);
        }

        return $next($request);
    }
}