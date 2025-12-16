// Backend Elasticsearch API tipleri
// /api/v1/search endpoint'i ile uyumlu

/**
 * Arama sonucu ürün bilgisi - Backend ProductSearchResult ile uyumlu
 */
export type ProductSearchResult = {
    id: number;
    name: string;
    slug?: string | null;
    brand?: string | null;
    category_id?: number | null;
    category_name?: string | null;
    gender?: string | null;
    image_url?: string | null;
    description?: string | null;
    lowest_price?: number | null;
    original_price?: number | null;
    currency_code: string;
    in_stock: boolean;
    colors: string[];
    sizes: string[];
    materials: string[];
    discount_percentage?: number | null;
};

/**
 * Arama response - Backend ProductSearchResponse ile uyumlu
 */
export type ProductSearchResponse = {
    query: string;
    products: ProductSearchResult[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
};

/**
 * Arama request parametreleri - Backend endpoint query params ile uyumlu
 */
export type ProductSearchParams = {
    q: string;
    category_id?: number;
    brand?: string;
    gender?: string;
    min_price?: number;
    max_price?: number;
    in_stock_only?: boolean;
    page?: number;
    page_size?: number;
};

/**
 * Autocomplete öneri tipi
 */
export type SearchSuggestion = {
    text: string;
    type: "query" | "category" | "brand";
    count?: number;
};

// ============ Legacy types (geriye uyumluluk için) ============

/**
 * @deprecated Use ProductSearchResult instead
 */
export type SearchResult = {
    id: string;
    title: string;
    category: string;
    categorySlug: string;
    price: number;
    originalPrice?: number;
    image?: string;
    rating?: number;
    reviewCount?: number;
};

/**
 * @deprecated Use ProductSearchResponse instead
 */
export type SearchResponse = {
    results: SearchResult[];
    suggestions: SearchSuggestion[];
    total: number;
    took: number;
};

/**
 * @deprecated Use ProductSearchParams instead
 */
export type SearchOptions = {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: "relevance" | "price_asc" | "price_desc" | "rating";
    limit?: number;
};
