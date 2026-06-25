<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

/**
 * Cek header X-Idempotency-Key sebelum request diteruskan ke Controller.
 * Lihat 02-system-structure.md §7.
 *
 * Key disimpan di Redis dengan TTL 24 jam (Decision Log #003). Kalau key
 * yang sama sudah pernah diproses, langsung return response tersimpan
 * TANPA menjalankan ulang TransferService.
 */
class EnsureIdempotency
{
    private const TTL_HOURS = 24;

    public function handle(Request $request, Closure $next): Response
    {
        $key = $request->header('X-Idempotency-Key');

        if (! $key) {
            return response()->json([
                'success' => false,
                'message' => 'Header X-Idempotency-Key wajib disertakan.',
            ], 400);
        }

        $cacheKey = "idempotency:{$key}";
        $cached = Cache::get($cacheKey);

        if ($cached !== null) {
            return response()->json(
                $cached['body'],
                $cached['status'],
            );
        }

        /** @var Response $response */
        $response = $next($request);

        // Hanya simpan response sukses (2xx) — error tidak perlu di-replay,
        // supaya user bisa retry dengan key baru kalau memang gagal validasi.
        if ($response->getStatusCode() >= 200 && $response->getStatusCode() < 300) {
            Cache::put($cacheKey, [
                'body' => json_decode($response->getContent(), true),
                'status' => $response->getStatusCode(),
            ], now()->addHours(self::TTL_HOURS));
        }

        return $response;
    }
}