<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class ConfirmTotpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // otorisasi sesungguhnya dicek via middleware auth:sanctum di route
    }

    public function rules(): array
    {
        return [
            'code' => ['required'],
        ];
    }

    /**
     * Validasi manual supaya pesan presisi per skenario — konsisten dengan
     * pola TopUpRequest.php (lihat 01-brd-documentation.md §4.3 sebagai acuan gaya).
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $code = $this->input('code');

            if ($code === null || $code === '') {
                $validator->errors()->add('code', 'Kode tidak boleh kosong.');
                return;
            }

            if (! ctype_digit((string) $code)) {
                $validator->errors()->add('code', 'Kode harus berupa angka.');
                return;
            }

            if (strlen((string) $code) !== 6) {
                $validator->errors()->add('code', 'Kode harus terdiri dari 6 digit.');
            }
        });
    }
}