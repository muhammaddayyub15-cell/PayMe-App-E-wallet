<?php

namespace App\Repositories;

use App\Models\AuditLog;
use App\Repositories\Contracts\AuditRepositoryInterface;

class AuditRepository implements AuditRepositoryInterface
{
    public function log(string $action, array $context): AuditLog
    {
        return AuditLog::create([
            'user_id' => $context['user_id'] ?? null,
            'action' => $action,
            'ip_address' => $context['ip_address'] ?? null,
            'user_agent' => $context['user_agent'] ?? null,
            'payload' => $context['payload'] ?? null,
        ]);
    }
}