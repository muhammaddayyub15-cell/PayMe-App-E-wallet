<?php

namespace App\Services;

use App\Models\User;
use App\Mail\TopUpSuccessMail;
use App\Services\AuditLogService;
use App\Services\NotificationService;
use App\Repositories\Contracts\TransactionRepositoryInterface;
use App\Repositories\Contracts\WalletRepositoryInterface;
use Illuminate\Support\Facades\DB;

class TopUpService
{
    public function __construct(
        protected WalletRepositoryInterface $walletRepository,
        protected TransactionRepositoryInterface $transactionRepository,
        protected AuditLogService $auditLogService,
        protected NotificationService $notificationService,
    ) {}

    /**
     * Top-up saldo internal (Phase 1). Lihat 02-system-structure.md §5.1.
     *
     * @return array{wallet: \App\Models\Wallet, transaction: WalletTransaction}
     */
    public function execute(User $user, int $amount): array
    {
        $result = DB::transaction(function () use ($user, $amount) {
            $wallet = $this->walletRepository->findByUserId($user->id);
            $wallet = $this->walletRepository->lockForUpdate($wallet->id);

            $wallet = $this->walletRepository->credit($wallet, $amount);

            $transaction = $this->transactionRepository->create([
                'wallet_id' => $wallet->id,
                'type' => 'TOPUP',
                'amount' => $amount,
                'balance_after' => $wallet->balance,
                'related_wallet_id' => null,
                'idempotency_key' => null,
            ]);

            $this->auditLogService->log('TOPUP', [
                'amount' => $amount,
                'transaction_id' => $transaction->id,
            ], $user->id);
            

            return [
                'wallet' => $wallet,
                'transaction' => $transaction,
            ];
        });

        $this->notificationService->dispatch(
            new TopUpSuccessMail(
                recipientName: $user->name,
                amount:        $amount,
                balanceAfter:  $result['wallet']->balance,
                transactedAt:  now()->toDateTimeString(),
            ),
            $user,
        );

        return $result;
    }
}
