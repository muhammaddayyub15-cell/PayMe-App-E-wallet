<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OtpLog extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'code',
        'expires_at',
        'used_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'used_at'    => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Helper: cek apakah OTP masih valid (belum expired & belum dipakai)
    public function isValid(): bool
    {
        return $this->used_at === null
            && $this->expires_at->isFuture();
    }
}