<?php

namespace App\Providers;

use App\Repositories\AuditRepository;
use App\Repositories\Contracts\AuditRepositoryInterface;
use App\Repositories\Contracts\TransactionRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Contracts\WalletRepositoryInterface;
use App\Repositories\TransactionRepository;
use App\Repositories\UserRepository;
use App\Repositories\WalletRepository;
use Illuminate\Support\ServiceProvider;
use App\Services\PaymentGatewayService;
use App\Services\TopUpGatewayService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * Bind Repository Interface ke implementasi konkret di sini saja.
     * Swap database (mis. ke PostgreSQL) hanya perlu ubah baris di bawah —
     * Service dan Controller tidak tersentuh. Lihat 03-projects-structure.md §3.
     */
    public function register(): void
    {
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->singleton(PaymentGatewayService::class);
        $this->app->singleton(TopUpGatewayService::class);
        $this->app->bind(WalletRepositoryInterface::class, WalletRepository::class);
        $this->app->bind(AuditRepositoryInterface::class, AuditRepository::class);
        $this->app->bind(TransactionRepositoryInterface::class, TransactionRepository::class);

        // Repository untuk modul Transfer ditambahkan saat modul tersebut
        // dikerjakan (reuse WalletRepository & TransactionRepository di atas)
        // — lihat 09-ai-agent-tracker.md
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
