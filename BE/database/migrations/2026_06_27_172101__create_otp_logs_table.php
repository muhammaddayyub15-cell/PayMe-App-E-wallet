<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('otp_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            // type: TRANSFER_OTP (bisa dikembangkan ke WITHDRAWAL_OTP dll nanti)
            $table->string('type', 50)->default('TRANSFER_OTP');

            // kode 6 digit, disimpan as string supaya leading zero aman
            $table->string('code', 6);

            $table->timestamp('expires_at');
            $table->timestamp('used_at')->nullable(); // null = belum dipakai

            $table->timestamps();

            $table->index(['user_id', 'type']);
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('otp_logs');
    }
};