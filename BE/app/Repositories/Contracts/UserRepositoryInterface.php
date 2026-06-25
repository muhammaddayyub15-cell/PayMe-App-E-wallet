<?php

namespace App\Repositories\Contracts;

use App\Models\User;

interface UserRepositoryInterface
{
    /**
     * Cari user berdasarkan email.
     */
    public function findByEmail(string $email): ?User;

    /**
     * Cari user berdasarkan nomor HP.
     */
    public function findByPhone(string $phone): ?User;

    /**
     * Cari user berdasarkan email ATAU nomor HP — dipakai saat Transfer
     * untuk resolve receiver_identifier (lihat 02-system-structure.md §5.2).
     */
    public function findByEmailOrPhone(string $identifier): ?User;
    public function findById(int $id): ?User;
    public function getAllPaginated(int $perPage = 15): \Illuminate\Contracts\Pagination\LengthAwarePaginator;
    public function updateSuspendStatus(int $id, bool $isSuspended): void;

    /**
     * Buat user baru.
     *
     * @param array $data name, email, phone, password (sudah di-hash), role
     */
    public function create(array $data): User;
}
