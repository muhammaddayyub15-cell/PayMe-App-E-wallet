<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\Request;

class LogoutController extends Controller
{
    public function __construct(
        private AuthService $authService
    ) {}

    /**
     * POST /api/logout — lihat 04-api-documentation.md §3.3.
     */
    public function __invoke(Request $request)
    {
        $this->authService->logout($request->user());

        return response()
            ->json([
                'success' => true,
                'message' => 'Logout berhasil.',
            ])
            ->withCookie(cookie()->forget('access_token'))
            ->withCookie(cookie()->forget('refresh_token'));
    }
}