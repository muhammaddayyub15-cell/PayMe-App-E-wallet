<?php

namespace App\Repositories;

use App\Models\User;
use App\Models\Wallet;
use App\Repositories\Contracts\WalletRepositoryInterface;

class WalletRepository implements WalletRepositoryInterface
{
    public function createForUser(User $user): Wallet
    {
        return Wallet::create([
            'user_id' => $user->id,
            'balance' => 0,
        ]);
    }

    public function findByUserId(int $userId): ?Wallet
    {
        return Wallet::where('user_id', $userId)->first();
    }

    /**
     * lockForUpdate() WAJIB dipanggil di dalam DB::transaction() —
     * di luar transaction, lock tidak akan ter-hold dan tidak ada efeknya.
     *
     * Saat Transfer mengunci 2 wallet sekaligus, Service yang memanggil method
     * ini WAJIB mengurutkan pemanggilan berdasarkan wallet_id ASC (bukan
     * Repository ini) untuk mencegah deadlock — lihat 02-system-structure.md §5.2.
     */
    public function lockForUpdate(int $walletId): Wallet
    {
        return Wallet::where('id', $walletId)
            ->lockForUpdate()
            ->first();
    }

    public function credit(Wallet $wallet, int $amount): Wallet
    {
        $wallet->increment('balance', $amount);

        return $wallet->refresh();
    }

    public function deduct(Wallet $wallet, int $amount): Wallet
    {
        $wallet->decrement('balance', $amount);

        return $wallet->refresh();
    }
}