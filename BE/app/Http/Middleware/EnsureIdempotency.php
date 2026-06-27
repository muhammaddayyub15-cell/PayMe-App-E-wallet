<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

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

        try {
            $cached = Cache::get($cacheKey);
        } catch (\Exception $e) {
            report($e);
            return $next($request);
        }

        if ($cached !== null) {
            return response()->json($cached['body'], $cached['status']);
        }

        $response = $next($request);

        if ($response->getStatusCode() >= 200 && $response->getStatusCode() < 300) {
            try {
                Cache::put($cacheKey, [
                    'body'   => json_decode($response->getContent(), true),
                    'status' => $response->getStatusCode(),
                ], now()->addHours(self::TTL_HOURS));
            } catch (\Exception $e) {
                report($e);
            }
        }

        return $response;
    }
}