<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WalletTransaction;
use App\Repositories\Contracts\TransactionRepositoryInterface;
use Illuminate\Http\JsonResponse;

class TransactionController extends Controller
{
    public function __construct(
        protected TransactionRepositoryInterface $transactionRepository,
    ) {}

    public function index(): JsonResponse
    {
        $transactions = $this->transactionRepository->getAllPaginated();

        return response()->json([
            'success' => true,
            'message' => 'Daftar transaksi berhasil diambil.',
            'data'    => collect($transactions->items())->map(fn (WalletTransaction $t) => [
                'id'            => $t->id,
                'user_id'       => $t->wallet->user_id,
                'user_name'     => $t->wallet->user->name,
                'type'          => $t->type,
                'amount'        => $t->amount,
                'balance_after' => $t->balance_after,
                'counterparty'  => $this->resolveCounterparty($t),
                'created_at'    => $t->created_at->toISOString(),
            ]),
            'meta'    => [
                'current_page' => $transactions->currentPage(),
                'last_page'    => $transactions->lastPage(),
                'per_page'     => $transactions->perPage(),
                'total'        => $transactions->total(),
            ],
        ]);
    }

    protected function resolveCounterparty($transaction): ?string
    {
        if (in_array($transaction->type, ['TRANSFER_OUT', 'TRANSFER_IN']) && $transaction->relatedWallet) {
            return $transaction->relatedWallet->user->name ?? null;
        }

        return null;
    }
}