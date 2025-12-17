'use client';

import { useEffect, useState } from 'react';

import { Loader2 } from 'lucide-react';

import { searchService } from '@/api/search';
import type { ProductSearchResult } from '@/api/search';
import { ProductSection } from '@/components/home';

type SortOption = 'default' | 'discount' | 'popular';

type RealProductsSectionProps = {
    title: string;
    sortBy?: SortOption;
    showFilter?: boolean;
    limit?: number;
};

export function RealProductsSection({
    title,
    sortBy = 'default',
    showFilter = false,
    limit = 50
}: RealProductsSectionProps) {
    const [products, setProducts] = useState<ProductSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const result = await searchService.searchProducts({
                    q: '*', // Tüm ürünler
                    page: 1,
                    page_size: limit,
                    in_stock_only: false,
                });

                if (result.success) {
                    let sortedProducts = result.data.products;

                    // Sıralama yap
                    if (sortBy === 'discount') {
                        // Fiyatı düşenleri göster (discount_percentage'e göre sırala)
                        sortedProducts = sortedProducts
                            .filter(p => p.discount_percentage && p.discount_percentage > 0)
                            .sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0));
                    } else if (sortBy === 'popular') {
                        // En popüler ürünler (lowest_price'a göre - düşük fiyatlı daha popüler kabul ediyoruz)
                        // Veya başka bir kriter kullanılabilir
                        sortedProducts = sortedProducts
                            .sort((a, b) => (a.lowest_price || 0) - (b.lowest_price || 0));
                    }

                    setProducts(sortedProducts);
                } else {
                    setError('Ürünler yüklenirken bir hata oluştu.');
                }
            } catch (err) {
                console.error('Fetch products error:', err);
                setError('Bağlantı hatası oluştu.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [sortBy, limit]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Ürünler yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <p className="text-lg font-semibold mb-2">Bir hata oluştu</p>
                <p className="text-muted-foreground">{error}</p>
            </div>
        );
    }

    // API'den gelen ProductSearchResult tipini Product tipine dönüştür
    const convertedProducts = products.map((p) => ({
        id: String(p.id),
        title: p.name,
        slug: p.slug || `product-${p.id}`,
        image: p.image_url || `https://picsum.photos/seed/${p.id}/400/400`,
        brand: p.brand || 'Marka',
        category: p.category_name || 'Kategori',
        rating: undefined,
        reviewCount: undefined,
        lowestPrice: p.lowest_price || 0,
        highestPrice: p.original_price || p.lowest_price || 0,
        sellerCount: 1,
        priceDropPercent: p.discount_percentage || undefined,
        sellers: [],
    }));

    return (
        <ProductSection
            title={title}
            products={convertedProducts}
            showFilter={showFilter}
        />
    );
}
