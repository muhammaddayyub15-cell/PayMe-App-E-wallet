<?php

namespace App\Repositories;

use App\Models\WalletTransaction;
use App\Repositories\Contracts\TransactionRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class TransactionRepository implements TransactionRepositoryInterface
{
    public function create(array $data): WalletTransaction
    {
        return WalletTransaction::create($data);
    }

    public function getByWalletId(int $walletId, int $perPage = 15): LengthAwarePaginator
    {
        return WalletTransaction::with(['relatedWallet.user'])
            ->where('wallet_id', $walletId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function getAllPaginated(int $perPage = 15): LengthAwarePaginator
    {
        return WalletTransaction::with(['wallet.user', 'relatedWallet.user'])
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }
}
