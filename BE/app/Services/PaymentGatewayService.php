<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PaymentGatewayService
{
    protected string $baseUrl;
    protected string $apiKey;
    protected string $privateKey;
    protected string $merchantCode;

    public function __construct()
    {
        $config            = config('payme.tripay');
        $this->baseUrl     = $config['is_sandbox'] ? $config['sandbox_url'] : $config['base_url'];
        $this->apiKey      = $config['api_key'];
        $this->privateKey  = $config['private_key'];
        $this->merchantCode = $config['merchant_code'];
    }

    // ── Create QRIS Charge ────────────────────────────────────────────────────

    public function createQrisCharge(array $payload): array
    {
        $merchantRef = 'PAY-' . strtoupper(Str::random(10));

        $signature = hash_hmac(
            'sha256',
            $this->merchantCode . $merchantRef . $payload['amount'],
            $this->privateKey
        );

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
        ])->post($this->baseUrl . '/transaction/create', [
            'method'         => 'QRIS',
            'merchant_ref'   => $merchantRef,
            'amount'         => $payload['amount'],
            'customer_name'  => $payload['customer_name'],
            'customer_email' => $payload['customer_email'],
            'customer_phone' => $payload['customer_phone'],
            'order_items'    => [
                [
                    'name'     => 'Top-Up PayMe Wallet',
                    'price'    => $payload['amount'],
                    'quantity' => 1,
                ],
            ],
            'signature'      => $signature,
            'expired_time'   => now()->addHour()->timestamp,
        ]);

        if (!$response->successful() || !$response->json('success')) {
            throw new \RuntimeException(
                $response->json('message') ?? 'Gagal membuat transaksi ke Tripay.'
            );
        }

        return [
            'merchant_ref' => $merchantRef,
            'reference'    => $response->json('data.reference'),
            'qr_url'       => $response->json('data.qr_url'),
            'qr_string'    => $response->json('data.qr_string'),
            'amount'       => $payload['amount'],
            'expired_time' => $response->json('data.expired_time'),
        ];
    }

    // ── Validate Webhook Signature ────────────────────────────────────────────

    public function validateWebhookSignature(string $signature, string $rawBody): bool
    {
        $expected = hash_hmac('sha256', $rawBody, $this->privateKey);

        return hash_equals($expected, $signature);
    }
}