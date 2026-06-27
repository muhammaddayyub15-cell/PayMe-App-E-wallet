<?php

namespace App\Services;

use App\Repositories\Contracts\WalletRepositoryInterface;
use App\Repositories\Contracts\TransactionRepositoryInterface;
use App\Mail\TopUpSuccessMail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class TopUpGatewayService
{
    public function __construct(
        protected PaymentGatewayService $paymentGatewayService,
        protected WalletRepositoryInterface $walletRepository,
        protected TransactionRepositoryInterface $transactionRepository,
        protected AuditLogService $auditLogService,
        protected NotificationService $notificationService,
    ) {}

    // ── Create Charge (Step 1) ────────────────────────────────────────────────

    public function createCharge($user, int $amount): array
    {
        $charge = $this->paymentGatewayService->createQrisCharge([
            'amount'         => $amount,
            'customer_name'  => $user->name,
            'customer_email' => $user->email,
            'customer_phone' => $user->phone,
        ]);

        // Simpan pending charge ke cache — TTL 1 jam sesuai expired_time Tripay
        Cache::put(
            'topup_charge:' . $charge['merchant_ref'],
            [
                'user_id'      => $user->id,
                'amount'       => $amount,
                'reference'    => $charge['reference'],
                'merchant_ref' => $charge['merchant_ref'],
            ],
            3600
        );

        return $charge;
    }

    // ── Handle Webhook (Step 2 — dipanggil dari WebhookController) ───────────

   public function handleWebhook(array $payload): void
{
    $merchantRef = $payload['merchant_ref'];
    $status      = $payload['status'];

    if ($status !== 'PAID') {
        return;
    }

    $cached = Cache::get('topup_charge:' . $merchantRef);

    if (!$cached) {
        throw new \RuntimeException('Charge tidak ditemukan atau sudah diproses.');
    }

    $lockKey = 'topup_processing:' . $merchantRef;

    if (Cache::has($lockKey)) {
        return;
    }

    Cache::put($lockKey, true, 300);

    DB::transaction(function () use ($cached) {
        $wallet = $this->walletRepository->findByUserId($cached['user_id']);
        $wallet = $this->walletRepository->lockForUpdate($wallet->id);
        $wallet = $this->walletRepository->credit($wallet, $cached['amount']);

        $transaction = $this->transactionRepository->create([
            'wallet_id'     => $wallet->id,
            'type'          => 'TOPUP',
            'amount'        => $cached['amount'],
            'balance_after' => $wallet->balance,
        ]);

        $this->auditLogService->log('TOPUP', [
            'amount'         => $cached['amount'],
            'transaction_id' => $transaction->id,
            'source'         => 'tripay_qris',
        ], $cached['user_id']);
    });

    $user = \App\Models\User::find($cached['user_id']);

    $this->notificationService->dispatch(
        new TopUpSuccessMail(
            recipientName: $user->name,
            amount:        $cached['amount'],
            balanceAfter:  $user->wallet->fresh()->balance,
            transactedAt:  now()->toDateTimeString(),
        ),
        $user,
    );

    Cache::forget('topup_charge:' . $merchantRef);
}
}