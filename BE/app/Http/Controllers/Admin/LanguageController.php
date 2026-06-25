<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LanguageBundle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class LanguageController extends Controller
{
    public function index(): JsonResponse
    {
        $bundles = LanguageBundle::orderBy('locale')->orderBy('key')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar bundle berhasil diambil.',
            'data'    => $bundles,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'locale' => ['required', 'string', 'in:en,id'],
            'key'    => ['required', 'string', 'max:150'],
            'value'  => ['required', 'string'],
        ]);

        $bundle = LanguageBundle::create($request->only('locale', 'key', 'value'));

        Cache::forget('language_bundle:' . $request->input('locale'));

        return response()->json([
            'success' => true,
            'message' => 'Key berhasil ditambahkan.',
            'data'    => $bundle,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'value' => ['required', 'string'],
        ]);

        $bundle = LanguageBundle::findOrFail($id);
        $bundle->update(['value' => $request->value]);

        Cache::forget('language_bundle:' . $bundle->locale);

        return response()->json([
            'success' => true,
            'message' => 'Key berhasil diupdate.',
            'data'    => $bundle->fresh(),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        /** @var LanguageBundle $bundle */
        $bundle = LanguageBundle::findOrFail($id);
        $locale = $bundle->getAttribute('locale');

        $bundle->delete();

        Cache::forget('language_bundle:' . $locale);

        return response()->json([
            'success' => true,
            'message' => 'Key berhasil dihapus.',
        ]);
    }
}