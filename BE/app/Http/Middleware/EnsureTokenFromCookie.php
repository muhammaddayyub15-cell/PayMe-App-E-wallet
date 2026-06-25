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
        if (! $request->bearerToken() && $request->cookie('access_token')) {
            $request->headers->set(
                'Authorization',
                'Bearer ' . $request->cookie('access_token')
            );
        }

        return $next($request);
    }
}