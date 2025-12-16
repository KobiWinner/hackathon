'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { Loader2, Search, SlidersHorizontal, X } from 'lucide-react';

import { searchService, type ProductSearchResult, type ProductSearchResponse } from '@/api/search';
import { Button } from '@/components/ui/buttons/Button';
import { Container } from '@/components/ui/Container';
import { Skeleton } from '@/components/ui/feedback/Skeleton';
import { Heading, Text } from '@/components/ui/typography/Text';
import { cn } from '@/lib/cn';

// Ürün kartı
function ProductCard({ product }: { product: ProductSearchResult }) {
    const discountPercentage = product.discount_percentage;

    return (
        <Link
            href={`/product/${product.slug || product.id}`}
            className="group block bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300"
        >
            {/* Ürün Görseli */}
            <div className="relative aspect-square bg-muted overflow-hidden">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Text color="muted">Görsel Yok</Text>
                    </div>
                )}

                {/* İndirim Badge */}
                {discountPercentage && discountPercentage > 0 && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-danger text-white text-xs font-bold">
                        %{discountPercentage} İndirim
                    </div>
                )}

                {/* Stok durumu */}
                {!product.in_stock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Text color="white" weight="semibold">Stokta Yok</Text>
                    </div>
                )}
            </div>

            {/* Ürün Bilgileri */}
            <div className="p-4 space-y-2">
                {/* Marka */}
                {product.brand && (
                    <Text size="xs" color="primary" weight="medium" className="uppercase tracking-wide">
                        {product.brand}
                    </Text>
                )}

                {/* Ürün Adı */}
                <Text size="sm" weight="medium" maxLines={2} className="group-hover:text-primary transition-colors">
                    {product.name}
                </Text>

                {/* Kategori */}
                {product.category_name && (
                    <Text size="xs" color="muted">
                        {product.category_name}
                    </Text>
                )}

                {/* Fiyat */}
                <div className="flex items-center gap-2 pt-1">
                    <Text size="lg" weight="bold" color="primary">
                        {product.lowest_price?.toLocaleString('tr-TR')} {product.currency_code}
                    </Text>
                    {product.original_price && product.original_price > (product.lowest_price ?? 0) && (
                        <Text size="sm" color="muted" lineThrough>
                            {product.original_price.toLocaleString('tr-TR')} {product.currency_code}
                        </Text>
                    )}
                </div>

                {/* Renk ve Beden Seçenekleri */}
                <div className="flex items-center gap-2 pt-2">
                    {product.colors.length > 0 && (
                        <Text size="xs" color="muted">
                            {product.colors.length} renk
                        </Text>
                    )}
                    {product.sizes.length > 0 && (
                        <Text size="xs" color="muted">
                            • {product.sizes.length} beden
                        </Text>
                    )}
                </div>
            </div>
        </Link>
    );
}

// Yükleme skeleton
function ProductSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <Skeleton className="aspect-square" />
            <div className="p-4 space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-6 w-24 mt-2" />
            </div>
        </div>
    );
}

// Ana içerik componenti
function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<ProductSearchResponse | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Arama yap
    useEffect(() => {
        if (!query) {
            setData(null);
            return;
        }

        const doSearch = async () => {
            setIsLoading(true);
            setError(null);

            const result = await searchService.searchProducts({
                q: query,
                page_size: 24,
            });

            if (result.success) {
                setData(result.data);
            } else {
                setError(result.error.message);
            }

            setIsLoading(false);
        };

        doSearch();
    }, [query]);

    // Query yoksa
    if (!query) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                    <Search className="w-10 h-10 text-muted-foreground" />
                </div>
                <Heading level={2} size="xl" align="center">
                    Arama Yapın
                </Heading>
                <Text color="muted" align="center" className="mt-2 max-w-md">
                    Yukarıdaki arama çubuğunu kullanarak ürün, marka veya kategori arayabilirsiniz.
                </Text>
            </div>
        );
    }

    return (
        <div>
            {/* Başlık ve Filtreler */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <Heading level={1} size="2xl">
                        "{query}" için sonuçlar
                    </Heading>
                    {data && (
                        <Text color="muted" className="mt-1">
                            {data.total} ürün bulundu
                        </Text>
                    )}
                </div>

                <Button
                    variant="ghost"
                    icon={<SlidersHorizontal className="w-4 h-4" />}
                    txt="Filtreler"
                    onClick={() => setShowFilters(!showFilters)}
                />
            </div>

            {/* Filtre Paneli */}
            {showFilters && (
                <div className="mb-8 p-6 bg-muted rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <Text weight="semibold">Filtreler</Text>
                        <button onClick={() => setShowFilters(false)}>
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>
                    <Text color="muted" size="sm">
                        Filtre seçenekleri yakında eklenecek...
                    </Text>
                </div>
            )}

            {/* Yükleniyor */}
            {isLoading && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <ProductSkeleton key={i} />
                    ))}
                </div>
            )}

            {/* Hata */}
            {error && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-20 h-20 rounded-full bg-danger-light flex items-center justify-center mb-6">
                        <X className="w-10 h-10 text-danger" />
                    </div>
                    <Heading level={2} size="xl" align="center">
                        Bir hata oluştu
                    </Heading>
                    <Text color="muted" align="center" className="mt-2">
                        {error}
                    </Text>
                    <Button
                        variant="solid"
                        txt="Tekrar Dene"
                        className="mt-6"
                        onClick={() => window.location.reload()}
                    />
                </div>
            )}

            {/* Sonuçlar */}
            {!isLoading && !error && data && (
                <>
                    {data.products.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {data.products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                                <Search className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <Heading level={2} size="xl" align="center">
                                Sonuç bulunamadı
                            </Heading>
                            <Text color="muted" align="center" className="mt-2 max-w-md">
                                "{query}" için sonuç bulunamadı. Farklı anahtar kelimeler deneyebilirsiniz.
                            </Text>
                        </div>
                    )}

                    {/* Sayfalama */}
                    {data.total_pages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-12">
                            <Text color="muted" size="sm">
                                Sayfa {data.page} / {data.total_pages}
                            </Text>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// Ana sayfa componenti
export default function SearchPage() {
    return (
        <div className="pb-12 min-h-screen">
            <Container>
                <Suspense fallback={
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                }>
                    <SearchContent />
                </Suspense>
            </Container>
        </div>
    );
}
