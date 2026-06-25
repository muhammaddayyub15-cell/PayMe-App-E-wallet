<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class TopUpRequest extends FormRequest
{
    private const MIN_AMOUNT = 10000;
    private const MAX_AMOUNT = 10000000;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * Validasi dasar. Pesan presisi per-skenario (huruf, simbol, desimal,
     * negatif) ditangani manual di withValidator() supaya sesuai persis
     * dengan tabel skenario di 01-brd-documentation.md §4.3.
     */
    public function rules(): array
    {
        return [
            'amount' => ['required'],
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
                $validator->errors()->add('amount', 'Nominal minimum top-up adalah Rp ' . number_format(self::MIN_AMOUNT, 0, ',', '.') . '.');
            }
        });
    }
}