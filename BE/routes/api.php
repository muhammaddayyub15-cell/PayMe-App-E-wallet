<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\RefreshTokenController;
use App\Http\Controllers\TopUpController;
use App\Http\Controllers\TransferController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\TopUpGatewayController;
use App\Http\Controllers\WebhookController;
use App\Http\Controllers\LanguageController;
use App\Http\Controllers\Admin\LanguageController as AdminLanguageController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\TransactionController as AdminTransactionController;
use App\Http\Controllers\WalletController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes — tidak butuh auth
|--------------------------------------------------------------------------
*/

Route::post('/register', RegisterController::class);

Route::post('/login', LoginController::class)
    ->middleware(['lockout', 'throttle:5,1']);

// Refresh access_token via refresh_token cookie — lihat RefreshTokenController.
// Public route: validasi dilakukan manual di controller, bukan via auth:sanctum,
// karena guard tersebut memvalidasi access_token, bukan refresh_token.
Route::post('/refresh', RefreshTokenController::class)
    ->middleware('throttle:10,1');

// Webhook Tripay — validasi signature di controller, bukan via auth
Route::post('/webhook/tripay', [WebhookController::class, 'handleTripay']);

// Phase 3 — bundle bahasa publik, di-cache Redis
Route::get('/languages/{locale}', [LanguageController::class, 'show']);

/*
|--------------------------------------------------------------------------
| Authenticated Routes — lihat 04-api-documentation.md
|--------------------------------------------------------------------------
*/

Route::middleware(['token.cookie', 'auth:sanctum'])->group(function () {

    Route::post('/logout', LogoutController::class);

    // Wallet & Top-Up — §4
    Route::get('/wallet', [WalletController::class, 'show']);
    Route::post('/topup', TopUpController::class);

    // Top-Up QRIS Phase 2
    Route::post('/topup/create-charge', [TopUpGatewayController::class, 'createCharge']);

    // Transfer — §5 — idempotency + rate limit 20 req/jam
    Route::post('/transfer', [TransferController::class, 'store'])
        ->middleware(['idempotency', 'throttle:20,60']);

    // Transaction History — §6
    Route::get('/transactions', [TransactionController::class, 'index']);

    // Admin — §7
    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::patch('/users/{id}/suspend', [AdminUserController::class, 'suspend']);
        Route::get('/transactions', [AdminTransactionController::class, 'index']);

        // Phase 3 — admin translation manager
        Route::get('/languages', [AdminLanguageController::class, 'index']);
        Route::post('/languages', [AdminLanguageController::class, 'store']);
        Route::put('/languages/{id}', [AdminLanguageController::class, 'update']);
        Route::delete('/languages/{id}', [AdminLanguageController::class, 'destroy']);
    });
});