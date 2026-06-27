<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Services\OtpService;
use Illuminate\Http\Request;

class OtpController extends Controller
{
    public function __construct(private OtpService $otpService) {}

    /**
     * POST /api/otp/send
     * Kirim kode OTP ke email user yang sedang login.
     */
    public function send(Request $request)
    {
        $this->otpService->send($request->user());

        return response()->json([
            'success' => true,
            'message' => 'Kode OTP telah dikirim ke email kamu.',
        ]);
    }

    /**
     * POST /api/otp/verify
     * Verifikasi kode OTP — set grace period jika valid.
     */
    public function verify(VerifyOtpRequest $request)
    {
        $isValid = $this->otpService->verify(
            $request->user(),
            $request->input('code')
        );

        if (! $isValid) {
            return response()->json([
                'success' => false,
                'message' => 'Kode OTP tidak valid atau sudah kedaluwarsa.',
                'errors'  => ['code' => ['Kode OTP tidak valid atau sudah kedaluwarsa.']],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'OTP terverifikasi.',
        ]);
    }
}