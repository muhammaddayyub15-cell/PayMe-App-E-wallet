<?php

namespace App\Http\Controllers;

use App\Models\LanguageBundle;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class LanguageController extends Controller
{
    public function show(string $locale): JsonResponse
    {
        $supported = ['en', 'id'];

        if (!in_array($locale, $supported)) {
            return response()->json([
                'success' => false,
                'message' => 'Locale tidak didukung.',
            ], 404);
        }

        $bundle = Cache::rememberForever(
            'language_bundle:' . $locale,
            fn () => LanguageBundle::where('locale', $locale)
                ->pluck('value', 'key')
                ->toArray()
        );

        return response()->json([
            'success' => true,
            'message' => 'Bundle berhasil diambil.',
            'data'    => $bundle,
        ]);
    }
}