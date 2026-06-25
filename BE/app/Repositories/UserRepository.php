<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;

class UserRepository implements UserRepositoryInterface
{
    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function findByPhone(string $phone): ?User
    {
        return User::where('phone', $phone)->first();
    }

    public function findById(int $id): ?User
{
    return User::find($id);
}

public function getAllPaginated(int $perPage = 15): \Illuminate\Contracts\Pagination\LengthAwarePaginator
{
    return User::orderBy('created_at', 'desc')->paginate($perPage);
}

public function updateSuspendStatus(int $id, bool $isSuspended): void
{
    User::where('id', $id)->update(['is_suspended' => $isSuspended]);
}

public function findByEmailOrPhone(string $identifier): ?User
{
    {
        return User::where('email', $identifier)
            ->orWhere('phone', $identifier)
            ->first();
    }

    public function create(array $data): User
    {
        return User::create($data);
    }
}