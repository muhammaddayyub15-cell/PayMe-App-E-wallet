<?php

namespace App\Http\Controllers;

use App\Http\Requests\TopUpRequest;
use App\Services\TopUpGatewayService;
use Illuminate\Http\JsonResponse;

class TopUpGatewayController extends Controller
{
    public function __construct(
        protected TopUpGatewayService $topUpGatewayService,
    ) {}

    public function createCharge(TopUpRequest $request): JsonResponse
    {
        $charge = $this->topUpGatewayService->createCharge(
            $request->user(),
            (int) $request->amount,
        );

        return response()->json([
            'success' => true,
            'message' => 'Charge berhasil dibuat. Silakan scan QR code.',
            'data'    => [
                'merchant_ref' => $charge['merchant_ref'],
                'qr_url'       => $charge['qr_url'],
                'qr_string'    => $charge['qr_string'],
                'amount'       => $charge['amount'],
                'expired_time' => $charge['expired_time'],
            ],
        ]);
    }
}