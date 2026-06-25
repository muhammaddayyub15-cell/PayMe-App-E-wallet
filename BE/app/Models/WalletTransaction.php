<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WalletTransaction extends Model
{
    // Catatan: model ini insert-only (lihat 07-database-design.md §12).
    // Jangan tambahkan logic update/delete di sini atau di Repository-nya.

    protected $fillable = [
        'wallet_id',
        'type',
        'amount',
        'balance_after',
        'related_wallet_id',
        'idempotency_key',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'balance_after' => 'integer',
        ];
    }

    // ── Relasi
    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }

    public function relatedWallet()
    {
        return $this->belongsTo(Wallet::class, 'related_wallet_id');
    }
}