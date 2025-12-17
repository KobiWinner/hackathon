'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Loader2 } from 'lucide-react';

import { searchService } from '@/api/search';
import type { ProductSearchResult } from '@/api/search';
import { ProductFilter, type FilterValues, type FilterOption } from '@/components/ProductFilter';
import { Container } from '@/components/ui/Container';
import { Caption, Heading, Text } from '@/components/ui/typography/Text';

export default function ProductListPage() {
    const searchParams = useSearchParams();
    const queryFromUrl = searchParams.get('q') || '';

    // Ürünler ve loading state
    const [products, setProducts] = useState<ProductSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalProducts, setTotalProducts] = useState(0);

    // Filtre seçenekleri (tüm ürünlerden çıkarılacak, değişmeyecek)
    const [allCategories, setAllCategories] = useState<FilterOption[]>([]);
    const [allBrands, setAllBrands] = useState<FilterOption[]>([]);
    const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 0 });
    const hasLoadedFilterOptions = useRef(false);

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

    // Tüm ürünlerden filtre seçeneklerini çıkar
    const extractFilterOptions = useCallback((products: ProductSearchResult[]) => {
        // Kategoriler
        const uniqueCategories = [...new Set(products.map(p => p.category_name).filter(Boolean))];
        const categoryOptions = uniqueCategories.map(cat => ({ value: cat!, label: cat! }));
        categoryOptions.sort((a, b) => a.label.localeCompare(b.label, 'tr'));

        // Markalar
        const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];
        const brandOptions = uniqueBrands.map(brand => ({ value: brand!, label: brand! }));
        brandOptions.sort((a, b) => a.label.localeCompare(b.label, 'tr'));

        // Fiyat aralığı
        const prices = products.map(p => p.lowest_price || 0).filter(p => p > 0);
        const minPrice = prices.length > 0 ? Math.floor(Math.min(...prices)) : 0;
        const maxPrice = prices.length > 0 ? Math.ceil(Math.max(...prices)) : 0;

        return { categoryOptions, brandOptions, minPrice, maxPrice };
    }, []);

    // İlk yüklemede tüm filtre seçeneklerini çek
    const fetchFilterOptions = useCallback(async (searchQuery: string) => {
        try {
            const result = await searchService.searchProducts({
                q: searchQuery || '*',
                page: 1,
                page_size: 200, // Filtre seçenekleri için daha fazla ürün al
                in_stock_only: false, // Stokta olmayanları da getir
            });

            if (result.success) {
                const { categoryOptions, brandOptions, minPrice, maxPrice } = extractFilterOptions(result.data.products);
                setAllCategories(categoryOptions);
                setAllBrands(brandOptions);
                setPriceRange({ min: minPrice, max: maxPrice });
                hasLoadedFilterOptions.current = true;
            }
        } catch (err) {
            console.error('Filter options fetch error:', err);
        }
    }, [extractFilterOptions]);

    // API'den ürünleri çek
    const fetchProducts = useCallback(async (searchQuery: string, filters: FilterValues) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await searchService.searchProducts({
                q: searchQuery || '*', // Boş ise tüm ürünleri getir
                min_price: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
                max_price: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
                brand: filters.brands.length === 1 ? filters.brands[0] : undefined,
                in_stock_only: false, // Stokta olmayanları da getir
                page: 1,
                page_size: 50,
            });

            if (result.success) {
                let filteredProducts = result.data.products;

                // İlk yüklemede filtre seçeneklerini de güncelle (eğer henüz yüklenmediyse)
                if (!hasLoadedFilterOptions.current) {
                    const { categoryOptions, brandOptions, minPrice, maxPrice } = extractFilterOptions(filteredProducts);
                    setAllCategories(categoryOptions);
                    setAllBrands(brandOptions);
                    setPriceRange({ min: minPrice, max: maxPrice });
                    hasLoadedFilterOptions.current = true;
                }

                // Frontend'de ek filtreleme (çoklu brand filtreleme)
                if (filters.brands.length > 1) {
                    filteredProducts = filteredProducts.filter(p =>
                        filters.brands.includes(p.brand || '')
                    );
                }

                // Frontend'de ek filtreleme (kategori - API'de category_id var ama isim yok)
                if (filters.categories.length > 0) {
                    filteredProducts = filteredProducts.filter(p =>
                        filters.categories.includes(p.category_name || '')
                    );
                }

                // Sıralama
                switch (filters.sortBy) {
                    case 'price_asc':
                        filteredProducts.sort((a, b) => (a.lowest_price || 0) - (b.lowest_price || 0));
                        break;
                    case 'price_desc':
                        filteredProducts.sort((a, b) => (b.lowest_price || 0) - (a.lowest_price || 0));
                        break;
                    case 'name_asc':
                        filteredProducts.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
                        break;
                    case 'name_desc':
                        filteredProducts.sort((a, b) => b.name.localeCompare(a.name, 'tr'));
                        break;
                }

                setProducts(filteredProducts);
                setTotalProducts(result.data.total);
            } else {
                setError('Ürünler yüklenirken bir hata oluştu.');
                setProducts([]);
            }
        } catch (err) {
            console.error('Fetch products error:', err);
            setError('Bağlantı hatası oluştu.');
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    }, [extractFilterOptions]);

    // URL'deki query değiştiğinde filtre seçeneklerini yeniden yükle
    useEffect(() => {
        hasLoadedFilterOptions.current = false;
        fetchFilterOptions(queryFromUrl);
    }, [queryFromUrl, fetchFilterOptions]);

    // URL'deki query veya filtreler değiştiğinde veri çek
    useEffect(() => {
        fetchProducts(queryFromUrl, activeFilters);
    }, [queryFromUrl, activeFilters, fetchProducts]);

    // Filtreleme işlemi - "Filtrele" butonuna basıldığında çalışır
    const handleFilter = (filters: FilterValues) => {
        setActiveFilters(filters);
        setIsMobileFilterOpen(false); // Mobilde filtre panelini kapat
    };

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
                    <Heading level={1} size="3xl">
                        {queryFromUrl ? `"${queryFromUrl}" için sonuçlar` : 'Ürünler'}
                    </Heading>
                    <br />
                    <Text color="muted" className="mt-2">
                        {queryFromUrl
                            ? `${totalProducts} ürün bulundu`
                            : 'Tüm ürünleri incele, fiyat karşılaştır ve en iyi fırsatları yakala!'}
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
                                <div className="flex items-center gap-2">
                                    {activeFilterCount > 0 && (
                                        <button
                                            onClick={() => {
                                                setActiveFilters({
                                                    categories: [],
                                                    brands: [],
                                                    minPrice: '',
                                                    maxPrice: '',
                                                    sortBy: '',
                                                });
                                                setIsMobileFilterOpen(false);
                                            }}
                                            className="text-xs px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-full font-medium transition-colors"
                                        >
                                            Temizle
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsMobileFilterOpen(false)}
                                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="h-[calc(100vh-80px)] overflow-y-auto">
                                <ProductFilter
                                    categories={allCategories}
                                    brands={allBrands}
                                    priceRange={priceRange}
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
                            categories={allCategories}
                            brands={allBrands}
                            priceRange={priceRange}
                            onFilter={handleFilter}
                        />
                    </aside>

                    {/* Product Grid Area */}
                    <div className="flex-1 min-w-0">
                        {/* Sonuç Sayısı */}
                        <div className="flex items-center justify-between mb-4 p-3 bg-card rounded-xl border border-border">
                            <Text color="muted">
                                <span className="font-semibold text-foreground">{products.length}</span> ürün bulundu
                            </Text>
                            {activeFilterCount > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                                        {activeFilterCount} filtre aktif
                                    </span>
                                    <button
                                        onClick={() => setActiveFilters({
                                            categories: [],
                                            brands: [],
                                            minPrice: '',
                                            maxPrice: '',
                                            sortBy: '',
                                        })}
                                        className="text-xs px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-full font-medium transition-colors flex items-center gap-1"
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Temizle
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Loading State */}
                        {isLoading && (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center">
                                    <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                                    <Text color="muted">Ürünler yükleniyor...</Text>
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {error && !isLoading && (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                                    <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <Text size="lg" weight="semibold" className="mb-2">Bir hata oluştu</Text>
                                <Text color="muted">{error}</Text>
                            </div>
                        )}

                        {/* Ürün Grid - Mobilde 2'li, tablet 2-3, desktop 3 */}
                        {!isLoading && !error && products.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                                {products.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/product/${product.id}`}
                                        className="block bg-card rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 group"
                                    >
                                        {/* Ürün Resmi */}
                                        <div className="relative aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-background mb-2 sm:mb-4">
                                            <Image
                                                src={product.image_url || `https://picsum.photos/seed/${product.id}/600/600`}
                                                alt={product.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                            />
                                            {/* İndirim Badge */}
                                            {product.discount_percentage && product.discount_percentage > 0 && (
                                                <div className="absolute top-1 left-1 sm:top-2 sm:left-2 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] sm:text-xs font-semibold rounded-full flex items-center gap-0.5 sm:gap-1">
                                                    🔥 <span className="hidden sm:inline">%{product.discount_percentage}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Ürün Bilgileri */}
                                        <div>
                                            <Caption className="text-[10px] sm:text-xs">{product.category_name || 'Kategori'}</Caption>
                                            <Text size="sm" weight="semibold" maxLines={2} className="mt-0.5 sm:mt-1 mb-0.5 sm:mb-1 group-hover:text-primary transition-colors text-xs sm:text-sm">
                                                {product.name}
                                            </Text>
                                            <Text size="xs" color="muted" className="hidden sm:block">{product.brand}</Text>

                                            {/* Fiyat */}
                                            <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border flex items-center justify-between">
                                                <div>
                                                    <Caption className="hidden sm:block">En düşük fiyat</Caption>
                                                    <Text size="sm" weight="bold" color="primary" className="sm:text-lg">
                                                        ₺{(product.lowest_price || 0).toLocaleString('tr-TR')}
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
                        )}

                        {/* Boş sonuç durumu */}
                        {!isLoading && !error && products.length === 0 && (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
                                    <svg className="w-10 h-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <Text size="lg" weight="semibold" className="mb-2">Ürün bulunamadı</Text>
                                <Text color="muted">
                                    {queryFromUrl
                                        ? `"${queryFromUrl}" için sonuç bulunamadı. Farklı bir arama deneyin.`
                                        : 'Filtre kriterlerinize uygun ürün bulunamadı. Farklı filtreler deneyin.'}
                                </Text>
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
}
