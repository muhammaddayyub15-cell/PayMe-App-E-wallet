<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WalletResource extends JsonResource
{
    /**
     * Format sesuai 04-api-documentation.md §4.1.
     */
    public function toArray(Request $request): array
    {
        return [
            'balance' => $this->balance,
            'currency' => 'IDR',
            'formatted' => 'Rp ' . number_format($this->balance, 0, ',', '.'),
        ];
    }
}