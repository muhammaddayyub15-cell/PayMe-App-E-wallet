<?php

namespace App\Services;

use App\Repositories\Contracts\AuditRepositoryInterface;
use Illuminate\Http\Request;

class AuditLogService
{
    public function __construct(
        private AuditRepositoryInterface $auditRepository
    ) {}

    /**
     * Catat aksi ke audit log. Context (user_id, ip_address, user_agent)
     * diambil otomatis dari Request — lihat 02-system-structure.md §10.
     *
     * @param string $action LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT, REGISTER_SUCCESS, dst
     * @param array $payload Data kontekstual TANPA password/token
     * @param int|null $userId Override user_id (dipakai saat LOGIN_FAILED, user belum auth)
     */
    public function log(string $action, array $payload = [], ?int $userId = null): void
    {
        $request = request();

        $this->auditRepository->log($action, [
            'user_id' => $userId ?? $request?->user()?->id,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'payload' => empty($payload) ? null : $payload,
        ]);
    }
}