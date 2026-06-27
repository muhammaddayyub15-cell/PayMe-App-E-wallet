<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Auth\AuthenticationException;

class LoginController extends Controller
{
    public function __construct(
        private AuthService $authService
    ) {}

    /**
     * POST /api/login — lihat 04-api-documentation.md §3.2.
     * Token TIDAK dikirim di response body — hanya via Set-Cookie httpOnly.
     *
     * Response tambahan untuk 2FA (lihat AuthService::login()):
     *   200 + { requires_2fa: true } -> password benar, FE wajib tampilkan
     *                                    input kode TOTP lalu re-submit
     *                                    /api/login dengan field totp_code
     *   200 + UserResource biasa     -> login tuntas (2FA tidak aktif ATAU
     *                                    totp_code sudah benar)
     */
    public function __invoke(LoginRequest $request)
    {
        try {
            $result = $this->authService->login(
                $request->input('email'),
                $request->input('password'),
                $request->input('totp_code'),
            );
        } catch (AuthenticationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 401);
        }

        // Password benar, tapi 2FA aktif dan kode belum/belum valid dikirim.
        // Sesi BELUM dibuat — tidak ada cookie session di response ini.
        if (! empty($result['requires_2fa'])) {
            return response()->json([
                'success' => true,
                'message' => 'Masukkan kode 2FA untuk melanjutkan.',
                'data' => [
                    'requires_2fa' => true,
                ],
            ], 200);
        }

        return (new UserResource($result['user']))
            ->additional([
                'success' => true,
                'message' => 'Login berhasil.',
            ])
            ->response()
            ->setStatusCode(200);
    }
}