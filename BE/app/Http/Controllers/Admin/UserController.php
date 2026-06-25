<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(
        protected UserRepositoryInterface $userRepository,
    ) {}

    public function index(): \Illuminate\Http\JsonResponse
    {
        $users = $this->userRepository->getAllPaginated();

        return response()->json([
            'success' => true,
            'message' => 'Daftar pengguna berhasil diambil.',
            'data'    => UserResource::collection($users),
            'meta'    => [
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
                'per_page'     => $users->perPage(),
                'total'        => $users->total(),
            ],
        ]);
    }

    public function suspend(Request $request, int $id): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'is_suspended' => ['required', 'boolean'],
        ]);

        $user = $this->userRepository->findById($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Pengguna tidak ditemukan.',
            ], 404);
        }

        $this->userRepository->updateSuspendStatus($id, $request->boolean('is_suspended'));

        return response()->json([
            'success' => true,
            'message' => $request->boolean('is_suspended') ? 'Akun berhasil disuspend.' : 'Akun berhasil diaktifkan.',
            'data'    => [
                'id'           => $user->id,
                'is_suspended' => $request->boolean('is_suspended'),
            ],
        ]);
    }
}