<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class TransferRequest extends FormRequest
{
    private const MIN_AMOUNT = 1000;
    private const MAX_AMOUNT = 50000000;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * Validasi dasar. Pesan presisi per-skenario nominal (huruf, kosong,
     * simbol, negatif, desimal, melebihi batas) ditangani di withValidator()
     * — sama seperti TopUpRequest, lihat Decision Log #010.
     *
     * Validasi receiver_identifier (apakah penerima ada / transfer ke diri
     * sendiri) DISENGAJA tidak dicek di sini — itu butuh query database
     * dan merupakan business logic, jadi ditangani di TransferService
     * (lihat 02-system-structure.md §5.2 step 1).
     */
    public function rules(): array
    {
        return [
            'receiver_identifier' => ['required', 'string'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $amount = $this->input('amount');

            if ($amount === null || $amount === '') {
                $validator->errors()->add('amount', 'Nominal tidak boleh kosong.');
                return;
            }

            if (! is_numeric($amount)) {
                $validator->errors()->add('amount', 'Nominal harus berupa angka.');
                return;
            }

            if (str_contains((string) $amount, '.')) {
                $validator->errors()->add('amount', 'Nominal hanya boleh bilangan bulat.');
                return;
            }

            $value = (int) $amount;

            if ($value < 0) {
                $validator->errors()->add('amount', 'Nominal tidak boleh negatif.');
                return;
            }

            if ($value > self::MAX_AMOUNT) {
                $validator->errors()->add('amount', 'Nominal melebihi batas maksimum transaksi.');
                return;
            }

            if ($value < self::MIN_AMOUNT) {
                $validator->errors()->add('amount', 'Nominal minimum transfer adalah Rp ' . number_format(self::MIN_AMOUNT, 0, ',', '.') . '.');
            }
        });
    }
}