<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    // Tidak ada updated_at — log tidak pernah diubah (lihat 07-database-design.md §7)
    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'action',
        'ip_address',
        'user_agent',
        'payload',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
        ];
    }

    // ── Relasi
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}