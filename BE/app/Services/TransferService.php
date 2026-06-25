<?php

namespace App\Services;

use App\Exceptions\InsufficientBalanceException;
use App\Exceptions\ReceiverNotFoundException;
use App\Exceptions\SelfTransferException;
use App\Models\User;
use App\Mail\TransferSuccessMail;
use App\Mail\TransferReceivedMail;
use App\Repositories\Contracts\TransactionRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Contracts\WalletRepositoryInterface;
use App\Services\NotificationService;
use Illuminate\Support\Facades\DB;

class TransferService
{
    public function __construct(
        private UserRepositoryInterface $userRepository,
        private WalletRepositoryInterface $walletRepository,
        private TransactionRepositoryInterface $transactionRepository,
        private AuditLogService $auditLogService,
        private NotificationService $notificationService,
    ) {}

    /**
     * Transfer saldo antar user. Lihat 02-system-structure.md §5.2 —
     * flow paling kritis, wajib row-level locking + DB transaction penuh.
     *
     * @return array{
     *     sender_wallet: \App\Models\Wallet,
     *     receiver: User,
     *     transaction_out: \App\Models\WalletTransaction,
     * }
     *
     * @throws ReceiverNotFoundException
     * @throws SelfTransferException
     * @throws InsufficientBalanceException
     */
    public function execute(User $sender, string $receiverIdentifier, int $amount): array
    {
        $result = DB::transaction(function () use ($sender, $receiverIdentifier, $amount) {
            // 1. Resolve receiver
            $receiver = $this->userRepository->findByEmailOrPhone($receiverIdentifier);

            if (! $receiver) {
                throw new ReceiverNotFoundException();
            }

            if ($receiver->id === $sender->id) {
                throw new SelfTransferException();
            }

            // 2. Lock kedua wallet — urutan ASC by wallet_id untuk mencegah
            // deadlock saat transfer dua arah terjadi bersamaan (Decision Log #002).
            $senderWalletRaw = $this->walletRepository->findByUserId($sender->id);
            $receiverWalletRaw = $this->walletRepository->findByUserId($receiver->id);

            $firstLockId = min($senderWalletRaw->id, $receiverWalletRaw->id);
            $secondLockId = max($senderWalletRaw->id, $receiverWalletRaw->id);

            $firstLocked = $this->walletRepository->lockForUpdate($firstLockId);
            $secondLocked = $this->walletRepository->lockForUpdate($secondLockId);

            $senderWallet = $firstLocked->id === $senderWalletRaw->id ? $firstLocked : $secondLocked;
            $receiverWallet = $firstLocked->id === $receiverWalletRaw->id ? $firstLocked : $secondLocked;

            // 3. Validasi saldo cukup
            if ($senderWallet->balance < $amount) {
                throw new InsufficientBalanceException();
            }

            // 4. Deduct sender, credit receiver
            $senderWallet = $this->walletRepository->deduct($senderWallet, $amount);
            $receiverWallet = $this->walletRepository->credit($receiverWallet, $amount);

            // 5. Buat 2 ledger entry
            $transactionOut = $this->transactionRepository->create([
                'wallet_id' => $senderWallet->id,
                'type' => 'TRANSFER_OUT',
                'amount' => $amount,
                'balance_after' => $senderWallet->balance,
                'related_wallet_id' => $receiverWallet->id,
                'idempotency_key' => null, // diisi oleh middleware idempotency, lihat EnsureIdempotency
            ]);

            $this->transactionRepository->create([
                'wallet_id' => $receiverWallet->id,
                'type' => 'TRANSFER_IN',
                'amount' => $amount,
                'balance_after' => $receiverWallet->balance,
                'related_wallet_id' => $senderWallet->id,
                'idempotency_key' => null,
            ]);

            // 6. Audit log
            $this->auditLogService->log('TRANSFER', [
                'amount' => $amount,
                'receiver_id' => $receiver->id,
                'transaction_id' => $transactionOut->id,
            ], $sender->id);

            return [
                'sender_wallet' => $senderWallet,
                'receiver' => $receiver,
                'transaction_out' => $transactionOut,
            ];
        });

        $this->notificationService->dispatch(
            new TransferSuccessMail(
                senderName: $sender->name,
                receiverName: $result['receiver']->name,
                amount: $amount,
                balanceAfter: $result['sender_wallet']->balance,
                transactedAt: now()->toDateTimeString(),
            ),
            $sender,
        );

        $this->notificationService->dispatch(
            new TransferReceivedMail(
                receiverName: $result['receiver']->name,
                senderName: $sender->name,
                amount: $amount,
                balanceAfter: $result['sender_wallet']->balance,
                transactedAt: now()->toDateTimeString(),
            ),
            $result['receiver'],
        );

        return $result;
    }
}
