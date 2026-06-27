<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'is_suspended',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret', // tidak pernah dikirim ke response JSON manapun
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'is_suspended' => 'boolean',
            'password' => 'hashed',
            'two_factor_secret' => 'encrypted', // dienkripsi at-rest, lihat migration 2FA
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    // ── Relasi
    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }

    public function notificationLogs()
    {
        return $this->hasMany(NotificationLog::class);
    }

    // ── Scope
    public function scopeAdmin($query)
    {
        return $query->where('role', 'admin');
    }

    // ── 2FA Helper
    public function hasTwoFactorEnabled(): bool
    {
        return $this->two_factor_confirmed_at !== null;
    }
}