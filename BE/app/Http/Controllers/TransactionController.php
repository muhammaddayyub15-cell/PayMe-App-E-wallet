<?php

namespace App\Http\Controllers;

use App\Http\Resources\TransactionCollection;
use App\Repositories\Contracts\TransactionRepositoryInterface;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function __construct(
        protected TransactionRepositoryInterface $transactionRepository,
    ) {}

    public function index(Request $request): TransactionCollection
    {
        $wallet       = $request->user()->wallet;
        $transactions = $this->transactionRepository->getByWalletId($wallet->id);

        return new TransactionCollection($transactions);
    }
}