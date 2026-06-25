<?php

namespace App\Repositories\Contracts;

use App\Models\User;
use App\Models\Wallet;

interface WalletRepositoryInterface
{
    /**
     * Buat wallet baru untuk user dengan saldo awal 0.
     * Dipanggil dari AuthService::register() — lihat 02-system-structure.md §4.1.
     */
    public function createForUser(User $user): Wallet;

    /**
     * Ambil wallet milik user tertentu.
     * Dipakai oleh WalletController (GET /api/wallet) dan TransactionRepository
     * untuk scope isolation — lihat 02-system-structure.md §5.3.
     */
    public function findByUserId(int $userId): ?Wallet;

    /**
     * Ambil wallet dengan row-level lock (SELECT ... FOR UPDATE).
     * WAJIB dipanggil di dalam DB::transaction() sebelum credit/deduct,
     * untuk mencegah race condition saat TopUp/Transfer — lihat
     * 02-system-structure.md §5.1, §5.2.
     */
    public function lockForUpdate(int $walletId): Wallet;

    /**
     * Tambah saldo wallet. Dipanggil setelah lockForUpdate().
     */
    public function credit(Wallet $wallet, int $amount): Wallet;

    /**
     * Kurangi saldo wallet. Dipanggil setelah lockForUpdate() dan
     * validasi saldo cukup sudah lolos (lihat InsufficientBalanceException).
     */
    public function deduct(Wallet $wallet, int $amount): Wallet;
}