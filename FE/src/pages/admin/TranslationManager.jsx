// ── Imports
import { useCallback, useEffect, useRef, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { invalidateBundleCache } from '../../i18n';

// ── Constants

const LOCALES = [
    { code: 'id', label: 'Bahasa Indonesia' },
    { code: 'en', label: 'English' },
];

// ── Sub-components

const LocaleTab = ({ locale, active, onClick }) => (
    <button
        type="button"
        onClick={() => onClick(locale.code)}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors
            ${active
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'}`}
    >
        {locale.label}
        <span className={`ml-1.5 text-xs ${active ? 'text-blue-200' : 'text-gray-400'}`}>
            {locale.code}
        </span>
    </button>
);

const StatusBadge = ({ status }) => {
    const map = {
        saving: ['bg-yellow-50 text-yellow-700', 'Menyimpan...'],
        saved:  ['bg-green-50 text-green-700',  'Tersimpan'],
        error:  ['bg-red-50 text-red-600',       'Gagal simpan'],
    };
    const [cls, label] = map[status] || [];
    if (!cls) return null;
    return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>
            {label}
        </span>
    );
};

const KeyValueRow = ({ item, onUpdate, onDelete }) => {
    const [editingValue, setEditingValue] = useState(item.value);
    const [rowStatus, setRowStatus] = useState(null); // null | 'saving' | 'saved' | 'error'
    const debounceRef = useRef(null);

    const handleValueChange = (e) => {
        const val = e.target.value;
        setEditingValue(val);
        setRowStatus(null);

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setRowStatus('saving');
            try {
                await onUpdate(item.id, item.key, val);
                setRowStatus('saved');
                setTimeout(() => setRowStatus(null), 2000);
            } catch {
                setRowStatus('error');
            }
        }, 800);
    };

    return (
        <tr className="group border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 w-2/5">
                <code className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-mono break-all">
                    {item.key}
                </code>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={editingValue}
                        onChange={handleValueChange}
                        className="flex-1 text-sm border-0 bg-transparent focus:outline-none focus:bg-white focus:border focus:border-blue-300 focus:rounded px-1 py-0.5 transition-all"
                    />
                    <StatusBadge status={rowStatus} />
                </div>
            </td>
            <td className="px-4 py-3 w-16">
                <button
                    type="button"
                    onClick={() => onDelete(item.id, item.key)}
                    className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-600 transition-all"
                    aria-label={`Hapus key ${item.key}`}
                >
                    Hapus
                </button>
            </td>
        </tr>
    );
};

const AddKeyModal = ({ locale, onAdd, onClose }) => {
    const [key, setKey] = useState('');
    const [value, setValue] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!key.trim()) { setError('Key tidak boleh kosong.'); return; }
        if (!value.trim()) { setError('Value tidak boleh kosong.'); return; }

        setIsLoading(true);
        try {
            await onAdd(key.trim(), value.trim());
            onClose();
        } catch {
      alert('Gagal menghapus key.');
    } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Tambah Translation Key</h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                            Locale: <span className="text-blue-600 font-mono">{locale}</span>
                        </label>
                        <input
                            type="text"
                            value={key}
                            onChange={(e) => { setKey(e.target.value); setError(''); }}
                            placeholder="auth.login.title"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => { setValue(e.target.value); setError(''); }}
                            placeholder="Teks terjemahan..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    {error && <p className="text-xs text-red-500">{error}</p>}
                    <div className="flex gap-2 mt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {isLoading ? 'Menyimpan...' : 'Tambah'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── Main Component

const TranslationManager = () => {
    // State
    const [activeLocale, setActiveLocale] = useState('id');
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [globalError, setGlobalError] = useState('');

    // Fetch bundle saat locale berubah
    const fetchBundle = useCallback(async (locale) => {
        setIsLoading(true);
        setGlobalError('');
        try {
            const res = await axiosInstance.get(`/admin/languages?locale=${locale}`);
            setItems(res.data.data || []);
        } catch (err) {
            setGlobalError('Gagal memuat translation bundle.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBundle(activeLocale);
    }, [activeLocale, fetchBundle]);

    // Handlers
    const handleLocaleChange = (code) => {
        setActiveLocale(code);
        setSearchQuery('');
    };

    const handleUpdate = async (id, key, value) => {
        await axiosInstance.put(`/admin/languages/${id}`, { key, value, locale: activeLocale });
        // Invalidate cache i18n agar perubahan langsung aktif
        invalidateBundleCache(activeLocale);
        setItems((prev) => prev.map((it) => it.id === id ? { ...it, value } : it));
    };

    const handleDelete = async (id, key) => {
        if (!window.confirm(`Hapus key "${key}"? Tindakan ini tidak dapat dibatalkan.`)) return;
        try {
            await axiosInstance.delete(`/admin/languages/${id}`);
            invalidateBundleCache(activeLocale);
            setItems((prev) => prev.filter((it) => it.id !== id));
        } catch {
            alert('Gagal menghapus key.');
        }
    };

    const handleAdd = async (key, value) => {
        const res = await axiosInstance.post('/admin/languages', {
            key,
            value,
            locale: activeLocale,
        });
        invalidateBundleCache(activeLocale);
        setItems((prev) => [...prev, res.data.data]);
    };

    // Filter
    const filtered = items.filter((it) => {
        const q = searchQuery.toLowerCase();
        return it.key.toLowerCase().includes(q) || it.value.toLowerCase().includes(q);
    });

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Translation Manager</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Kelola teks antarmuka per bahasa
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                    + Tambah Key
                </button>
            </div>

            {/* Locale Tabs */}
            <div className="flex gap-2 mb-4">
                {LOCALES.map((locale) => (
                    <LocaleTab
                        key={locale.code}
                        locale={locale}
                        active={activeLocale === locale.code}
                        onClick={handleLocaleChange}
                    />
                ))}
                <span className="ml-auto text-xs text-gray-400 self-center">
                    {items.length} key{items.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">⌕</span>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari key atau teks..."
                    className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Error */}
            {globalError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {globalError}
                </div>
            )}

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-sm">
                            {searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : 'Belum ada translation key.'}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="mt-3 text-sm text-blue-600 hover:underline"
                            >
                                Tambah key pertama →
                            </button>
                        )}
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Key
                                </th>
                                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Value ({activeLocale})
                                </th>
                                <th className="w-16" />
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((item) => (
                                <KeyValueRow
                                    key={item.id}
                                    item={item}
                                    onUpdate={handleUpdate}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Footer info */}
            {!isLoading && filtered.length > 0 && (
                <p className="text-xs text-gray-400 mt-3 text-center">
                    Perubahan tersimpan otomatis. Cache bundle akan di-refresh setelah edit.
                </p>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <AddKeyModal
                    locale={activeLocale}
                    onAdd={handleAdd}
                    onClose={() => setShowAddModal(false)}
                />
            )}
        </div>
    );
};

export default TranslationManager;