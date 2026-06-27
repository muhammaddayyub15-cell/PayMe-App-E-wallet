<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            // totp_code OPSIONAL di sini — wajib-tidaknya secara bisnis
            // (apakah user ini punya 2FA aktif) baru diketahui setelah
            // password diverifikasi, jadi dicek di AuthService::login(),
            // bukan di rule ini. Kalau dikirim, format-nya tetap divalidasi
            // di withValidator() di bawah — backend yang menentukan valid
            // atau tidak, bukan frontend.
            'totp_code' => ['nullable', 'string'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $code = $this->input('totp_code');

            // Tidak dikirim sama sekali -> valid, artinya "belum coba 2FA".
            if ($code === null || $code === '') {
                return;
            }

            if (! ctype_digit((string) $code)) {
                $validator->errors()->add('totp_code', 'Kode 2FA harus berupa angka.');
                return;
            }

            if (strlen((string) $code) !== 6) {
                $validator->errors()->add('totp_code', 'Kode 2FA harus terdiri dari 6 digit.');
            }
        });
    }
}