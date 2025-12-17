'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { searchService } from '@/api/search';
import type { ProductSearchParams, ProductSearchResult } from '@/api/search';

type UseElasticSearchOptions = {
    /** Debounce süresi (ms) */
    debounceMs?: number;
    /** Minimum karakter sayısı */
    minChars?: number;
    /** Arama seçenekleri */
    searchOptions?: Omit<ProductSearchParams, 'q'>;
    /** Otomatik arama */
    autoSearch?: boolean;
};

type UseElasticSearchReturn = {
    /** Arama terimi */
    query: string;
    /** Arama terimini güncelle */
    setQuery: (query: string) => void;
    /** Arama sonuçları */
    results: ProductSearchResult[];
    /** Son aramalar */
    recentSearches: string[];
    /** Yükleniyor durumu */
    isLoading: boolean;
    /** Hata mesajı */
    error: string | null;
    /** Toplam sonuç sayısı */
    total: number;
    /** Mevcut sayfa */
    page: number;
    /** Toplam sayfa sayısı */
    totalPages: number;
    /** Aramayı manuel tetikle */
    search: (query?: string) => Promise<void>;
    /** Temizle */
    clear: () => void;
    /** Son aramayı kaydet */
    saveToRecent: (query: string) => void;
    /** Son aramaları temizle */
    clearRecentSearches: () => void;
};

export function useElasticSearch(
    options: UseElasticSearchOptions = {}
): UseElasticSearchReturn {
    const {
        debounceMs = 300,
        minChars = 2,
        searchOptions = {},
        autoSearch = true,
    } = options;

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ProductSearchResult[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Son aramaları yükle
    useEffect(() => {
        setRecentSearches(searchService.getRecentSearches());
    }, []);

    // Arama fonksiyonu
    const search = useCallback(async (searchQuery?: string) => {
        const q = searchQuery ?? query;

        if (q.length < minChars) {
            setResults([]);
            setTotal(0);
            setTotalPages(0);
            return;
        }

        // Önceki isteği iptal et
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setIsLoading(true);
        setError(null);

        try {
            const response = await searchService.searchProducts({
                q,
                ...searchOptions,
            });

            if (response.success) {
                setResults(response.data.products);
                setTotal(response.data.total);
                setPage(response.data.page);
                setTotalPages(response.data.total_pages);
            } else {
                setError(response.error.message);
                setResults([]);
                setTotal(0);
            }
        } catch (err) {
            if (err instanceof Error && err.name !== 'AbortError') {
                setError(err.message);
            }
        } finally {
            setIsLoading(false);
        }
    }, [query, minChars, searchOptions]);

    // Debounced arama
    useEffect(() => {
        if (!autoSearch) { return; }

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (query.length >= minChars) {
            debounceRef.current = setTimeout(() => {
                search();
            }, debounceMs);
        } else {
            setResults([]);
            setTotal(0);
            setTotalPages(0);
        }

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query, debounceMs, minChars, autoSearch, search]);

    // Temizle
    const clear = useCallback(() => {
        setQuery('');
        setResults([]);
        setTotal(0);
        setPage(1);
        setTotalPages(0);
        setError(null);
    }, []);

    // Son aramayı kaydet
    const saveToRecent = useCallback((q: string) => {
        searchService.saveRecentSearch(q);
        setRecentSearches(searchService.getRecentSearches());
    }, []);

    // Son aramaları temizle
    const clearRecentSearches = useCallback(() => {
        searchService.clearRecentSearches();
        setRecentSearches([]);
    }, []);

    return {
        query,
        setQuery,
        results,
        recentSearches,
        isLoading,
        error,
        total,
        page,
        totalPages,
        search,
        clear,
        saveToRecent,
        clearRecentSearches,
    };
}
