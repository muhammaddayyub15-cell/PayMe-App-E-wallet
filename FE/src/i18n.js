// ── Imports
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { fetchLanguageBundle } from '../src/api/i18nApi';

// ── Config

const SUPPORTED_LOCALES = ['id', 'en'];
const DEFAULT_LOCALE = 'id';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 menit, untuk hindari refetch terlalu sering

// ── Runtime bundle cache (in-memory, session-scoped)
const bundleCache = {};

/**
 * Load bundle untuk satu locale.
 * Phase 1-2: load dari static JSON lokal (import).
 * Phase 3:   fetch dari API backend, cache di memory.
 *
 * Untuk toggle: ubah konstanta PHASE di bawah.
 */
const PHASE = 1; // Ubah ke 1 untuk fallback ke static JSON

const loadBundle = async (locale) => {
    if (PHASE < 3) {
        // Static JSON fallback (Phase 1-2)
        try {
            const module = await import(`../locales/${locale}.json`);
            return module.default;
        } catch {
            return {};
        }
    }

    // Phase 3: API-based bundle
    const now = Date.now();
    const cached = bundleCache[locale];
    if (cached && now - cached.loadedAt < CACHE_TTL_MS) {
        return cached.bundle;
    }

    try {
        const bundle = await fetchLanguageBundle(locale);
        bundleCache[locale] = { bundle, loadedAt: now };
        return bundle;
    } catch (err) {
        console.warn(`[i18n] Gagal fetch bundle '${locale}' dari API, fallback ke static JSON.`, err);
        try {
            const module = await import(`../locales/${locale}.json`);
            return module.default;
        } catch {
            return {};
        }
    }
};

// ── i18n Plugin: backend-like plugin menggunakan fetch custom

const ApiBackend = {
    type: 'backend',
    init() {},
    read(language, namespace, callback) {
        loadBundle(language)
            .then((resources) => callback(null, resources))
            .catch((err) => callback(err, null));
    },
};

// ── Init

i18n
    .use(ApiBackend)
    .use(initReactI18next)
    .init({
        lng: localStorage.getItem('payme_locale') || DEFAULT_LOCALE,
        fallbackLng: 'en',
        supportedLngs: SUPPORTED_LOCALES,
        ns: ['translation'],
        defaultNS: 'translation',
        interpolation: {
            escapeValue: false, // React sudah escape XSS
        },
        backend: {},
        react: {
            useSuspense: true,
        },
    });

export default i18n;

/**
 * Ganti locale runtime.
 * Simpan preferensi di localStorage agar persist antar session.
 */
export const changeLocale = async (locale) => {
    if (!SUPPORTED_LOCALES.includes(locale)) return;
    localStorage.setItem('payme_locale', locale);
    await i18n.changeLanguage(locale);
};

/**
 * Invalidate cache bundle untuk locale tertentu.
 * Dipanggil setelah admin melakukan edit translation.
 */
export const invalidateBundleCache = (locale) => {
    delete bundleCache[locale];
};