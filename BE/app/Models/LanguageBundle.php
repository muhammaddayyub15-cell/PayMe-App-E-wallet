<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LanguageBundle extends Model
{
    // Catatan: kolom `key` adalah reserved word MySQL.
    // Eloquent aman karena pakai query builder (auto-backtick),
    // tapi hindari raw query tanpa backtick: SELECT `key` FROM ...

    protected $table = 'language_bundles';

    protected $fillable = [
        'locale',
        'key',
        'value',
    ];
}