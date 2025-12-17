/**
 * Elasticsearch Product Search Service
 * Backend /api/v1/search endpoint'ine bağlanır
 */

import { httpClient } from "../httpClient";
import { normalizeAxiosError, type ApiError } from "../types";

import type {
    ProductSearchParams,
    ProductSearchResponse,
    ProductSearchResult,
    SearchSuggestion,
    // Legacy types
    SearchOptions,
    SearchResponse,
    SearchResult,
} from "./types";

// API endpoint
const SEARCH_ENDPOINT = "/api/v1/search";

// Recent searches storage key
const RECENT_SEARCHES_KEY = "recentSearches";
const MAX_RECENT_SEARCHES = 5;

/**
 * API çağrısı sonucu
 */
type SearchApiResult<T> =
    | { success: true; data: T }
    | { success: false; error: ApiError };

export const searchService = {
    /**
     * Elasticsearch üzerinden ürün arar
     * GET /api/v1/search
     */
    searchProducts: async (
        params: ProductSearchParams
    ): Promise<SearchApiResult<ProductSearchResponse>> => {
        try {
            // Query params oluştur
            const queryParams = new URLSearchParams();
            queryParams.set("q", params.q);

            if (params.category_id !== undefined) {
                queryParams.set("category_id", String(params.category_id));
            }
            if (params.brand) {
                queryParams.set("brand", params.brand);
            }
            if (params.gender) {
                queryParams.set("gender", params.gender);
            }
            if (params.min_price !== undefined) {
                queryParams.set("min_price", String(params.min_price));
            }
            if (params.max_price !== undefined) {
                queryParams.set("max_price", String(params.max_price));
            }
            if (params.in_stock_only !== undefined) {
                queryParams.set("in_stock_only", String(params.in_stock_only));
            }
            if (params.page !== undefined) {
                queryParams.set("page", String(params.page));
            }
            if (params.page_size !== undefined) {
                queryParams.set("page_size", String(params.page_size));
            }

            const response = await httpClient.get<ProductSearchResponse>(
                `${SEARCH_ENDPOINT}?${queryParams.toString()}`
            );

            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: normalizeAxiosError(error),
            };
        }
    },

    /**
     * Basit arama - sadece query string ile
     */
    search: async (
        query: string,
        options: { page?: number; pageSize?: number } = {}
    ): Promise<SearchApiResult<ProductSearchResponse>> => {
        return searchService.searchProducts({
            q: query,
            page: options.page ?? 1,
            page_size: options.pageSize ?? 20,
        });
    },

    /**
     * Autocomplete önerileri
     * NOT: Backend'de ayrı bir suggest endpoint'i yoksa,
     * kısa bir arama yaparak önerileri döner
     */
    suggest: async (query: string): Promise<ProductSearchResult[]> => {
        if (!query || query.length < 2) {
            return [];
        }

        const result = await searchService.searchProducts({
            q: query,
            page_size: 6,
        });

        if (result.success) {
            return result.data.products;
        }

        return [];
    },

    /**
     * Son aramaları localStorage'dan alır
     */
    getRecentSearches: (): string[] => {
        if (typeof window === "undefined") {
            return [];
        }

        try {
            const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    },

    /**
     * Son aramayı kaydeder
     */
    saveRecentSearch: (query: string): void => {
        if (typeof window === "undefined" || !query.trim()) {
            return;
        }

        try {
            const recent = searchService.getRecentSearches();
            const filtered = recent.filter((s) => s !== query);
            const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        } catch {
            // localStorage hatası - sessizce devam et
        }
    },

    /**
     * Son aramaları temizler
     */
    clearRecentSearches: (): void => {
        if (typeof window === "undefined") {
            return;
        }
        localStorage.removeItem(RECENT_SEARCHES_KEY);
    },

    // ============ Legacy methods (geriye uyumluluk) ============

    /**
     * @deprecated Use searchProducts instead
     * Legacy search method - eski SearchResponse formatını döner
     */
    legacySearch: async (
        query: string,
        options: SearchOptions = {}
    ): Promise<SearchResponse> => {
        const startTime = Date.now();

        const result = await searchService.searchProducts({
            q: query,
            min_price: options.minPrice,
            max_price: options.maxPrice,
            page_size: options.limit ?? 20,
        });

        if (!result.success) {
            return {
                results: [],
                suggestions: [],
                total: 0,
                took: Date.now() - startTime,
            };
        }

        // ProductSearchResult -> SearchResult dönüşümü
        const results: SearchResult[] = result.data.products.map((p) => ({
            id: String(p.id),
            title: p.name,
            category: p.category_name ?? "Kategori",
            categorySlug: p.slug ?? "kategori",
            price: p.lowest_price ?? 0,
            originalPrice: p.original_price ?? undefined,
            image: p.image_url ?? undefined,
        }));

        return {
            results,
            suggestions: [],
            total: result.data.total,
            took: Date.now() - startTime,
        };
    },
};

// Type exports for convenience
export type {
    ProductSearchParams,
    ProductSearchResponse,
    ProductSearchResult,
    SearchSuggestion,
    SearchOptions,
    SearchResponse,
    SearchResult,
};
