<?php

namespace App\Http\Controllers;

use App\Services\PaymentGatewayService;
use App\Services\TopUpGatewayService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class WebhookController extends Controller
{
    public function __construct(
        protected PaymentGatewayService $paymentGatewayService,
        protected TopUpGatewayService $topUpGatewayService,
    ) {}

    public function handleTripay(Request $request): JsonResponse
    {
        $rawBody   = $request->getContent();
        $signature = $request->header('X-Callback-Signature', '');

        if (!$this->paymentGatewayService->validateWebhookSignature($signature, $rawBody)) {
            return response()->json([
                'success' => false,
                'message' => 'Signature tidak valid.',
            ], 403);
        }

        $payload = $request->all();

        try {
            $this->topUpGatewayService->handleWebhook($payload);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses webhook.',
            ], 500);
        }

        return response()->json(['success' => true, 'message' => 'Webhook diterima.']);
    }
}