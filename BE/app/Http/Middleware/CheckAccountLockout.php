<?php

namespace App\Http\Middleware;

use App\Services\AuthService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAccountLockout
{
    public function __construct(
        private AuthService $authService
    ) {}

    /**
     * Cek Redis/Cache: failed_attempts:{email} >= 5 → 429.
     * Lihat 02-system-structure.md §4.2.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $email = $request->input('email');

        if ($email && $this->authService->isLockedOut($email)) {
            return response()->json([
                'success' => false,
                'message' => 'Akun terkunci, coba lagi dalam 15 menit.',
            ], 429);
        }

        return $next($request);
    }
}