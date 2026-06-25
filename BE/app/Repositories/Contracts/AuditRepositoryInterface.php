<?php

namespace App\Repositories\Contracts;

use App\Models\AuditLog;

interface AuditRepositoryInterface
{
    /**
     * Simpan satu entry audit log.
     *
     * @param string $action LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT, REGISTER_SUCCESS, dst
     *                        (lihat 07-database-design.md §7 untuk enum lengkap)
     * @param array $context user_id, ip_address, user_agent, payload
     */
    public function log(string $action, array $context): AuditLog;
}