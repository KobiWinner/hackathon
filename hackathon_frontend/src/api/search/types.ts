// Arama API tipleri

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

export type SearchSuggestion = {
    text: string;
    type: 'query' | 'category' | 'brand';
    count?: number;
};

export type SearchResponse = {
    results: SearchResult[];
    suggestions: SearchSuggestion[];
    total: number;
    took: number; // Elasticsearch response time in ms
};

export type SearchOptions = {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating';
    limit?: number;
};
