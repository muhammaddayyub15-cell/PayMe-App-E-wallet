<?php

use App\Exceptions\InsufficientBalanceException;
use App\Exceptions\ReceiverNotFoundException;
use App\Exceptions\SelfTransferException;
use App\Http\Middleware\CheckAccountLockout;
use App\Http\Middleware\EnsureIdempotency;
use App\Http\Middleware\EnsureTokenFromCookie;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureAdminRole::class,
            'lockout' => CheckAccountLockout::class,
            'token.cookie' => EnsureTokenFromCookie::class,
            'idempotency' => EnsureIdempotency::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Catatan: exception Transfer (Insufficient/ReceiverNotFound/SelfTransfer)
        // SUDAH ditangkap langsung di TransferController via try-catch — render
        // handler di sini HANYA fallback kalau exception lolos sampai luar
        // Controller (mis. dilempar dari Service lain di masa depan tanpa catch).
        // Lihat 02-system-structure.md §11 — format ikut Error Response Standard.
        $exceptions->render(function (InsufficientBalanceException $e, Request $request) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'errors' => ['amount' => [$e->getMessage()]],
            ], 422);
        });

        $exceptions->render(function (ReceiverNotFoundException $e, Request $request) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'errors' => ['receiver_identifier' => [$e->getMessage()]],
            ], 422);
        });

        $exceptions->render(function (SelfTransferException $e, Request $request) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'errors' => ['receiver_identifier' => [$e->getMessage()]],
            ], 422);
        });
    })->create();