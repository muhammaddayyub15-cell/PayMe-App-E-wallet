<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'type'          => $this->type,
            'amount'        => $this->amount,
            'balance_after' => $this->balance_after,
            'counterparty'  => $this->resolveCounterparty(),
            'created_at'    => $this->created_at->toISOString(),
        ];
    }

    protected function resolveCounterparty(): ?string
    {
        if (in_array($this->type, ['TRANSFER_OUT', 'TRANSFER_IN']) && $this->relatedWallet) {
            return $this->relatedWallet->user->name ?? null;
        }

        return null;
    }
}