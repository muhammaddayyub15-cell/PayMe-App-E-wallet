<?php

namespace App\Http\Controllers;

use App\Http\Requests\TransferRequest;
use App\Services\OtpService;
use App\Services\TransferService;
use Illuminate\Http\Request;

class TransferController extends Controller
{
    public function __construct(
        private TransferService $transferService,
        private OtpService $otpService,
    ) {}

    /**
     * POST /api/transfer
     * Cek grace period OTP → eksekusi transfer jika sudah verify.
     */
    public function store(TransferRequest $request)
    {
        $user = $request->user();

        // Setiap transfer wajib menyertakan OTP yang sudah diverifikasi
        if (! $request->boolean('otp_verified')) {
            return response()->json([
                'success'      => false,
                'message'      => 'Verifikasi OTP diperlukan sebelum transfer.',
                'otp_required' => true,
            ], 403);
        }

        $amount = $request->integer('amount');

        $result = $this->transferService->execute(
            sender:             $user,
            receiverIdentifier: $request->input('receiver_identifier'),
            amount:             $amount,
            idempotencyKey:     $request->header('X-Idempotency-Key'),
        );

      
        return response()->json([
            'success' => true,
            'message' => 'Transfer berhasil.',
            'data' => [
                'transaction_id' => $result['transaction_out']->id,
                'receiver_name'  => $result['receiver']->name,
                'amount'         => $amount,
                'balance_after'  => $result['sender_wallet']->balance,
                'type'           => 'TRANSFER_OUT',
            ],
        ]);
    }
}