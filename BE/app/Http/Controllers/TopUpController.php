<?php

namespace App\Http\Controllers;

use App\Http\Requests\TopUpRequest;
use App\Services\TopUpService;
use Illuminate\Http\JsonResponse;

class TopUpController extends Controller
{
    public function __construct(
        private TopUpService $topUpService
    ) {}

    /**
     * POST /api/topup — response format sesuai persis
     * 04-api-documentation.md §4.2 (bukan WalletResource biasa,
     * karena payload-nya gabungan wallet + transaction).
     */
    public function __invoke(TopUpRequest $request): JsonResponse
    {
        $result = $this->topUpService->execute(
            $request->user(),
            (int) $request->input('amount'),
        );

        return response()->json([
            'success' => true,
            'message' => 'Top-up berhasil.',
            'data' => [
                'balance' => $result['wallet']->balance,
                'transaction_id' => $result['transaction']->id,
                'amount' => $result['transaction']->amount,
                'type' => $result['transaction']->type,
            ],
        ], 200);
    }
}