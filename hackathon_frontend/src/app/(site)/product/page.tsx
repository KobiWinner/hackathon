'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { ProductFilter, type FilterValues } from '@/components/ProductFilter';
import { Container } from '@/components/ui/Container';
import { Caption, Heading, Text } from '@/components/ui/typography/Text';

// Mock ürün verisi
const mockProducts = [
    {
        id: 1,
        name: 'iPhone 15 Pro Max 256GB',
        brand: 'Apple',
        image_url: 'https://picsum.photos/seed/iphone15/600/600',
        category: 'Elektronik',
        minPrice: 64999,
        trendScore: 95,
    },
    {
        id: 2,
        name: 'Nike Air Max 270 React',
        brand: 'Nike',
        image_url: 'https://picsum.photos/seed/nike270/600/600',
        category: 'Moda',
        minPrice: 3199,
        trendScore: 78,
    },
    {
        id: 3,
        name: 'Sony WH-1000XM5 Kulaklık',
        brand: 'Sony',
        image_url: 'https://picsum.photos/seed/sonyxm5/600/600',
        category: 'Elektronik',
        minPrice: 8799,
        trendScore: 88,
    },
    {
        id: 4,
        name: 'MacBook Pro 14" M3 Pro',
        brand: 'Apple',
        image_url: 'https://picsum.photos/seed/macbookm3/600/600',
        category: 'Elektronik',
        minPrice: 73999,
        trendScore: 92,
    },
    {
        id: 5,
        name: 'Adidas Ultraboost 22',
        brand: 'Adidas',
        image_url: 'https://picsum.photos/seed/adidas22/600/600',
        category: 'Moda',
        minPrice: 4599,
        trendScore: 75,
    },
    {
        id: 6,
        name: 'Samsung Galaxy S24 Ultra',
        brand: 'Samsung',
        image_url: 'https://picsum.photos/seed/s24ultra/600/600',
        category: 'Elektronik',
        minPrice: 59999,
        trendScore: 90,
    },
    {
        id: 7,
        name: 'Zara Oversize Ceket',
        brand: 'Zara',
        image_url: 'https://picsum.photos/seed/zarajacket/600/600',
        category: 'Moda',
        minPrice: 1299,
        trendScore: 82,
    },
    {
        id: 8,
        name: 'LG OLED 55" TV',
        brand: 'LG',
        image_url: 'https://picsum.photos/seed/lgtv/600/600',
        category: 'Elektronik',
        minPrice: 42999,
        trendScore: 87,
    },
];

// Kategorileri ve markaları ürünlerden çıkar
const categories = [...new Set(mockProducts.map((p) => p.category))].map((cat) => ({
    value: cat,
    label: cat,
}));

const brands = [...new Set(mockProducts.map((p) => p.brand))].map((brand) => ({
    value: brand,
    label: brand,
}));

export default function ProductListPage() {
    // Aktif filtreler
    const [activeFilters, setActiveFilters] = useState<FilterValues>({
        categories: [],
        brands: [],
        minPrice: '',
        maxPrice: '',
        sortBy: '',
    });

    // Mobilde filtre panelini aç/kapat
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Filtreleme işlemi - "Filtrele" butonuna basıldığında çalışır
    const handleFilter = (filters: FilterValues) => {
        setActiveFilters(filters);
        setIsMobileFilterOpen(false); // Mobilde filtre panelini kapat
    };

    // Filtrelenmiş ve sıralanmış ürünler
    const filteredProducts = useMemo(() => {
        let result = [...mockProducts];

        // Kategori filtresi (çoklu seçim)
        if (activeFilters.categories.length > 0) {
            result = result.filter((p) => activeFilters.categories.includes(p.category));
        }

        // Marka filtresi (çoklu seçim)
        if (activeFilters.brands.length > 0) {
            result = result.filter((p) => activeFilters.brands.includes(p.brand));
        }

        // Min fiyat filtresi
        if (activeFilters.minPrice) {
            const minVal = parseFloat(activeFilters.minPrice);
            if (!isNaN(minVal)) {
                result = result.filter((p) => p.minPrice >= minVal);
            }
        }

        // Max fiyat filtresi
        if (activeFilters.maxPrice) {
            const maxVal = parseFloat(activeFilters.maxPrice);
            if (!isNaN(maxVal)) {
                result = result.filter((p) => p.minPrice <= maxVal);
            }
        }

        // Sıralama
        switch (activeFilters.sortBy) {
            case 'price_asc':
                result.sort((a, b) => a.minPrice - b.minPrice);
                break;
            case 'price_desc':
                result.sort((a, b) => b.minPrice - a.minPrice);
                break;
            case 'trend':
                result.sort((a, b) => b.trendScore - a.trendScore);
                break;
            case 'name_asc':
                result.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
                break;
            case 'name_desc':
                result.sort((a, b) => b.name.localeCompare(a.name, 'tr'));
                break;
        }

        return result;
    }, [activeFilters]);

    // Aktif filtre sayısı
    const activeFilterCount = useMemo(() => {
        let count = 0;
        count += activeFilters.categories.length;
        count += activeFilters.brands.length;
        if (activeFilters.minPrice) count++;
        if (activeFilters.maxPrice) count++;
        if (activeFilters.sortBy) count++;
        return count;
    }, [activeFilters]);

    return (
        <div className="min-h-screen bg-background py-8">
            <Container>
                {/* Başlık */}
                <div className="mb-6">
                    <Heading level={1} size="3xl">Ürünler</Heading>
                    <Text color="muted" className="mt-2">
                        Tüm ürünleri incele, fiyat karşılaştır ve en iyi fırsatları yakala!
                    </Text>
                </div>

                {/* Mobile Filter Button */}
                <button
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold shadow-lg shadow-primary/25"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filtrele
                    {activeFilterCount > 0 && (
                        <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                {/* Mobile Filter Overlay */}
                {isMobileFilterOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setIsMobileFilterOpen(false)}
                        />
                        {/* Filter Panel */}
                        <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-background animate-slide-in-left">
                            <div className="flex items-center justify-between p-4 border-b border-border">
                                <Text size="lg" weight="bold">Filtreler</Text>
                                <button
                                    onClick={() => setIsMobileFilterOpen(false)}
                                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="h-[calc(100vh-80px)] overflow-y-auto">
                                <ProductFilter
                                    categories={categories}
                                    brands={brands}
                                    onFilter={handleFilter}
                                    className="border-0 rounded-none shadow-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Layout: Sidebar + Products */}
                <div className="flex gap-6">
                    {/* Left Sidebar - Desktop Only */}
                    <aside className="hidden lg:block w-72 flex-shrink-0">
                        <ProductFilter
                            categories={categories}
                            brands={brands}
                            onFilter={handleFilter}
                        />
                    </aside>

                    {/* Product Grid Area */}
                    <div className="flex-1 min-w-0">
                        {/* Sonuç Sayısı */}
                        <div className="flex items-center justify-between mb-4 p-3 bg-card rounded-xl border border-border">
                            <Text color="muted">
                                <span className="font-semibold text-foreground">{filteredProducts.length}</span> ürün bulundu
                            </Text>
                            {activeFilterCount > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                                        {activeFilterCount} filtre aktif
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Ürün Grid - Mobilde 2'li, tablet 2-3, desktop 3 */}
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                            {filteredProducts.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/product/${product.id}`}
                                    className="block bg-card rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 group"
                                >
                                    {/* Ürün Resmi */}
                                    <div className="relative aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-background mb-2 sm:mb-4">
                                        <Image
                                            src={product.image_url}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        />
                                        {/* Trend Badge */}
                                        {product.trendScore >= 85 && (
                                            <div className="absolute top-1 left-1 sm:top-2 sm:left-2 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] sm:text-xs font-semibold rounded-full flex items-center gap-0.5 sm:gap-1">
                                                🔥 <span className="hidden sm:inline">Trend</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Ürün Bilgileri */}
                                    <div>
                                        <Caption className="text-[10px] sm:text-xs">{product.category}</Caption>
                                        <Text size="sm" weight="semibold" maxLines={2} className="mt-0.5 sm:mt-1 mb-0.5 sm:mb-1 group-hover:text-primary transition-colors text-xs sm:text-sm">
                                            {product.name}
                                        </Text>
                                        <Text size="xs" color="muted" className="hidden sm:block">{product.brand}</Text>

                                        {/* Fiyat */}
                                        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border flex items-center justify-between">
                                            <div>
                                                <Caption className="hidden sm:block">En düşük fiyat</Caption>
                                                <Text size="sm" weight="bold" color="primary" className="sm:text-lg">
                                                    ₺{product.minPrice.toLocaleString()}
                                                </Text>
                                            </div>
                                            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Boş sonuç durumu */}
                        {filteredProducts.length === 0 && (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
                                    <svg className="w-10 h-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <Text size="lg" weight="semibold" className="mb-2">Ürün bulunamadı</Text>
                                <Text color="muted">Filtre kriterlerinize uygun ürün bulunamadı. Farklı filtreler deneyin.</Text>
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
}
