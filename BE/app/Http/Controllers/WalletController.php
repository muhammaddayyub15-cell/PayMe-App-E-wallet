<?php

namespace App\Http\Controllers;

use App\Http\Resources\WalletResource;
use App\Repositories\Contracts\WalletRepositoryInterface;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function __construct(
        private WalletRepositoryInterface $walletRepository
    ) {}

    /**
     * GET /api/wallet — lihat 04-api-documentation.md §4.1.
     * Scope otomatis: hanya wallet milik user yang login.
     */
    public function show(Request $request)
    {
        $wallet = $this->walletRepository->findByUserId($request->user()->id);

        return (new WalletResource($wallet))
            ->additional([
                'success' => true,
                'message' => 'Saldo berhasil diambil.',
            ])
            ->response()
            ->setStatusCode(200);
    }
}