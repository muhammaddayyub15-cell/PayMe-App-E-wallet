<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;

class RegisterController extends Controller
{
    public function __construct(
        private AuthService $authService
    ) {}

    /**
     * POST /api/register — lihat 04-api-documentation.md §3.1.
     */
    public function __invoke(RegisterRequest $request)
    {
        $user = $this->authService->register($request->validated());

        return (new UserResource($user))
            ->additional([
                'success' => true,
                'message' => 'Registrasi berhasil.',
            ])
            ->response()
            ->setStatusCode(201);
    }
}