<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // ── 1. Admin ─────────────────────────────────────────────────────
        $admin = User::create([
            'name'     => 'Admin PayMe',
            'email'    => 'admin@payme.id',
            'phone'    => '081000000001',
            'password' => Hash::make('Admin@12345'),
            'role'     => 'admin',
        ]);
        $admin->wallet()->create(['balance' => 0]);

        // ── 2. User A — saldo banyak, banyak transaksi ───────────────────
        $userA = User::create([
            'name'     => 'Budi Santoso',
            'email'    => 'budi@example.com',
            'phone'    => '081234567890',
            'password' => Hash::make('Passw0rd!23'),
            'role'     => 'customer',
        ]);
        $walletA = $userA->wallet()->create(['balance' => 1500000]);

        // ── 3. User B — saldo menengah, penerima transfer ────────────────
        $userB = User::create([
            'name'     => 'Ani Wijaya',
            'email'    => 'ani@example.com',
            'phone'    => '089876543210',
            'password' => Hash::make('Passw0rd!23'),
            'role'     => 'customer',
        ]);
        $walletB = $userB->wallet()->create(['balance' => 500000]);

        // ── 4. User C — saldo minim, untuk test saldo tidak cukup ────────
        $userC = User::create([
            'name'     => 'Citra Dewi',
            'email'    => 'citra@example.com',
            'phone'    => '082111222333',
            'password' => Hash::make('Passw0rd!23'),
            'role'     => 'customer',
        ]);
        $walletC = $userC->wallet()->create(['balance' => 10000]);

        // ── Seed wallet_transactions untuk history realistis ─────────────

        // Budi: top-up 3x, transfer ke Ani 2x, terima dari Ani 1x
        $this->createTopUp($walletA, 500000);
        $this->createTopUp($walletA, 1000000);
        $this->createTopUp($walletA, 300000);
        $this->createTransfer($walletA, $walletB, 150000);
        $this->createTransfer($walletA, $walletB, 75000);
        $this->createTransfer($walletB, $walletA, 50000);

        // Ani: top-up 2x, transfer ke Citra 1x
        $this->createTopUp($walletB, 300000);
        $this->createTopUp($walletB, 200000);
        $this->createTransfer($walletB, $walletC, 100000);

        // Citra: top-up 1x kecil, tidak ada transfer keluar
        $this->createTopUp($walletC, 10000);
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private function createTopUp(Wallet $wallet, int $amount): void
    {
        WalletTransaction::create([
            'wallet_id'    => $wallet->id,
            'type'         => 'TOPUP',
            'amount'       => $amount,
            'balance_after'=> $wallet->balance,
            'created_at'   => now()->subDays(rand(1, 30)),
            'updated_at'   => now(),
        ]);
    }

    private function createTransfer(Wallet $sender, Wallet $receiver, int $amount): void
    {
        WalletTransaction::create([
            'wallet_id'         => $sender->id,
            'type'              => 'TRANSFER_OUT',
            'amount'            => $amount,
            'balance_after'     => $sender->balance,
            'related_wallet_id' => $receiver->id,
            'created_at'        => now()->subDays(rand(1, 30)),
            'updated_at'        => now(),
        ]);

        WalletTransaction::create([
            'wallet_id'         => $receiver->id,
            'type'              => 'TRANSFER_IN',
            'amount'            => $amount,
            'balance_after'     => $receiver->balance,
            'related_wallet_id' => $sender->id,
            'created_at'        => now()->subDays(rand(1, 30)),
            'updated_at'        => now(),
        ]);
    }
}