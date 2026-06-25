<?php

namespace App\Repositories\Contracts;

use App\Models\WalletTransaction;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface TransactionRepositoryInterface
{
    /**
     * Insert satu entry ledger. Tabel wallet_transactions bersifat
     * insert-only — TIDAK PERNAH di-update/delete (lihat 07-database-design.md §6).
     *
     * @param array $data wallet_id, type, amount, balance_after, related_wallet_id?, idempotency_key?
     */
    public function create(array $data): WalletTransaction;

    /**
     * Ambil riwayat mutasi milik satu wallet, paginated, urut terbaru dulu.
     * Dipakai untuk GET /api/transactions — scope isolation dilakukan
     * di sini (selalu filter by wallet_id) — lihat 02-system-structure.md §5.3.
     */
    public function getByWalletId(int $walletId, int $perPage = 15): LengthAwarePaginator;
    public function getAllPaginated(int $perPage = 15): LengthAwarePaginator;
}
