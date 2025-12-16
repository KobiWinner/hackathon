// Elasticsearch arama servisi (mock implementation)

import type { SearchOptions, SearchResponse, SearchResult, SearchSuggestion } from './types';

// Mock ürün verileri
const mockProducts: SearchResult[] = [
    {
        id: '1',
        title: 'iPhone 15 Pro Max 256GB',
        category: 'Telefon',
        categorySlug: 'telefon',
        price: 64999,
        originalPrice: 69999,
        image: 'https://picsum.photos/seed/iphone15/200/200',
        rating: 4.8,
        reviewCount: 1250,
    },
    {
        id: '2',
        title: 'Samsung Galaxy S24 Ultra',
        category: 'Telefon',
        categorySlug: 'telefon',
        price: 54999,
        image: 'https://picsum.photos/seed/samsung/200/200',
        rating: 4.7,
        reviewCount: 890,
    },
    {
        id: '3',
        title: 'MacBook Pro 14" M3 Pro',
        category: 'Laptop',
        categorySlug: 'laptop',
        price: 89999,
        originalPrice: 94999,
        image: 'https://picsum.photos/seed/macbook/200/200',
        rating: 4.9,
        reviewCount: 456,
    },
    {
        id: '4',
        title: 'Sony WH-1000XM5 Kulaklık',
        category: 'Kulaklık',
        categorySlug: 'kulaklik',
        price: 12999,
        image: 'https://picsum.photos/seed/sony/200/200',
        rating: 4.8,
        reviewCount: 2100,
    },
    {
        id: '5',
        title: 'Apple AirPods Pro 2',
        category: 'Kulaklık',
        categorySlug: 'kulaklik',
        price: 8999,
        originalPrice: 9999,
        image: 'https://picsum.photos/seed/airpods/200/200',
        rating: 4.7,
        reviewCount: 3400,
    },
    {
        id: '6',
        title: 'PlayStation 5 Digital Edition',
        category: 'Oyun Konsolu',
        categorySlug: 'oyun-konsolu',
        price: 18999,
        image: 'https://picsum.photos/seed/ps5/200/200',
        rating: 4.9,
        reviewCount: 5600,
    },
    {
        id: '7',
        title: 'LG OLED 55" 4K Smart TV',
        category: 'Televizyon',
        categorySlug: 'televizyon',
        price: 42999,
        originalPrice: 49999,
        image: 'https://picsum.photos/seed/lgtv/200/200',
        rating: 4.8,
        reviewCount: 780,
    },
    {
        id: '8',
        title: 'Apple Watch Series 9',
        category: 'Akıllı Saat',
        categorySlug: 'akilli-saat',
        price: 15999,
        image: 'https://picsum.photos/seed/applewatch/200/200',
        rating: 4.6,
        reviewCount: 1890,
    },
];

// Mock arama önerileri
const mockSuggestions: SearchSuggestion[] = [
    { text: 'iphone 15', type: 'query', count: 15420 },
    { text: 'iphone 15 pro', type: 'query', count: 8930 },
    { text: 'iphone kılıf', type: 'query', count: 5200 },
    { text: 'samsung', type: 'brand', count: 12300 },
    { text: 'kulaklık', type: 'category', count: 8900 },
    { text: 'laptop', type: 'category', count: 7600 },
    { text: 'playstation', type: 'brand', count: 4500 },
    { text: 'airpods', type: 'query', count: 6700 },
];

// Gecikme simülasyonu
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const searchService = {
    /**
     * Elasticsearch benzeri arama
     */
    search: async (query: string, options: SearchOptions = {}): Promise<SearchResponse> => {
        const startTime = Date.now();

        // Gerçek API'yi simüle etmek için gecikme
        await delay(150 + Math.random() * 100);

        const normalizedQuery = query.toLowerCase().trim();

        if (!normalizedQuery) {
            return {
                results: [],
                suggestions: [],
                total: 0,
                took: Date.now() - startTime,
            };
        }

        // Filtreleme
        let results = mockProducts.filter(product => {
            const matchesQuery =
                product.title.toLowerCase().includes(normalizedQuery) ||
                product.category.toLowerCase().includes(normalizedQuery);

            const matchesCategory = !options.category ||
                product.categorySlug === options.category;

            const matchesMinPrice = !options.minPrice ||
                product.price >= options.minPrice;

            const matchesMaxPrice = !options.maxPrice ||
                product.price <= options.maxPrice;

            return matchesQuery && matchesCategory && matchesMinPrice && matchesMaxPrice;
        });

        // Sıralama
        if (options.sortBy) {
            switch (options.sortBy) {
                case 'price_asc':
                    results.sort((a, b) => a.price - b.price);
                    break;
                case 'price_desc':
                    results.sort((a, b) => b.price - a.price);
                    break;
                case 'rating':
                    results.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
                    break;
            }
        }

        // Limit
        if (options.limit) {
            results = results.slice(0, options.limit);
        }

        // İlgili öneriler
        const suggestions = mockSuggestions
            .filter(s => s.text.toLowerCase().includes(normalizedQuery))
            .slice(0, 5);

        return {
            results,
            suggestions,
            total: results.length,
            took: Date.now() - startTime,
        };
    },

    /**
     * Autocomplete önerileri
     */
    suggest: async (query: string): Promise<SearchSuggestion[]> => {
        await delay(50 + Math.random() * 50);

        const normalizedQuery = query.toLowerCase().trim();

        if (!normalizedQuery || normalizedQuery.length < 2) {
            return [];
        }

        return mockSuggestions
            .filter(s => s.text.toLowerCase().startsWith(normalizedQuery))
            .slice(0, 6);
    },

    /**
     * Son aramalar (localStorage'dan)
     */
    getRecentSearches: (): string[] => {
        if (typeof window === 'undefined') {return [];}

        try {
            const stored = localStorage.getItem('recentSearches');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    },

    /**
     * Son aramayı kaydet
     */
    saveRecentSearch: (query: string): void => {
        if (typeof window === 'undefined') {return;}

        try {
            const recent = searchService.getRecentSearches();
            const filtered = recent.filter(s => s !== query);
            const updated = [query, ...filtered].slice(0, 5);
            localStorage.setItem('recentSearches', JSON.stringify(updated));
        } catch {
            // localStorage hatası
        }
    },

    /**
     * Son aramaları temizle
     */
    clearRecentSearches: (): void => {
        if (typeof window === 'undefined') {return;}
        localStorage.removeItem('recentSearches');
    },
};
