'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { searchService } from '@/api/search';
import type { SearchOptions, SearchResponse, SearchResult, SearchSuggestion } from '@/api/search';

type UseElasticSearchOptions = {
    /** Debounce süresi (ms) */
    debounceMs?: number;
    /** Minimum karakter sayısı */
    minChars?: number;
    /** Arama seçenekleri */
    searchOptions?: SearchOptions;
    /** Otomatik arama */
    autoSearch?: boolean;
};

type UseElasticSearchReturn = {
    /** Arama terimi */
    query: string;
    /** Arama terimini güncelle */
    setQuery: (query: string) => void;
    /** Arama sonuçları */
    results: SearchResult[];
    /** Autocomplete önerileri */
    suggestions: SearchSuggestion[];
    /** Son aramalar */
    recentSearches: string[];
    /** Yükleniyor durumu */
    isLoading: boolean;
    /** Hata */
    error: Error | null;
    /** Toplam sonuç sayısı */
    total: number;
    /** Elasticsearch yanıt süresi (ms) */
    took: number;
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
    const [results, setResults] = useState<SearchResult[]>([]);
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [total, setTotal] = useState(0);
    const [took, setTook] = useState(0);

    const debounceRef = useRef<ReturnType<typeof setTimeout>>();
    const abortControllerRef = useRef<AbortController>();

    // Son aramaları yükle
    useEffect(() => {
        setRecentSearches(searchService.getRecentSearches());
    }, []);

    // Arama fonksiyonu
    const search = useCallback(async (searchQuery?: string) => {
        const q = searchQuery ?? query;

        if (q.length < minChars) {
            setResults([]);
            setSuggestions([]);
            setTotal(0);
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
            const response: SearchResponse = await searchService.search(q, searchOptions);

            setResults(response.results);
            setSuggestions(response.suggestions);
            setTotal(response.total);
            setTook(response.took);
        } catch (err) {
            if (err instanceof Error && err.name !== 'AbortError') {
                setError(err);
            }
        } finally {
            setIsLoading(false);
        }
    }, [query, minChars, searchOptions]);

    // Debounced arama
    useEffect(() => {
        if (!autoSearch) {return;}

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (query.length >= minChars) {
            debounceRef.current = setTimeout(() => {
                search();
            }, debounceMs);
        } else {
            setResults([]);
            setSuggestions([]);
            setTotal(0);
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
        setSuggestions([]);
        setTotal(0);
        setTook(0);
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
        suggestions,
        recentSearches,
        isLoading,
        error,
        total,
        took,
        search,
        clear,
        saveToRecent,
        clearRecentSearches,
    };
}
