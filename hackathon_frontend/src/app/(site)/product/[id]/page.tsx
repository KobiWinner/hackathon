'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { Loader2 } from 'lucide-react';

import { searchService } from '@/api/search';
import type { ProductSearchResult } from '@/api/search';
import {
    BestPriceCard,
    Breadcrumb,
    ColorSelector,
    PriceHistoryChart,
    PriceStatsCards,
    ProviderPriceTable,
    SizeSelector,
    TIME_RANGES,
} from '@/components/product';
import type { PriceStats, ProviderPrice, TimeRangeKey } from '@/components/product';
import { Button } from '@/components/ui/buttons/Button';
import { Container } from '@/components/ui/Container';
import { Caption, Heading, Text } from '@/components/ui/typography/Text';

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const productId = Number(params.id);

    // State
    const [product, setProduct] = useState<ProductSearchResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRangeKey>('1m');

    // Ürünü API'den çek
    const fetchProduct = useCallback(async () => {
        if (!productId || isNaN(productId)) {
            setError('Geçersiz ürün ID');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await searchService.getProductById(productId);
            if (result.success) {
                setProduct(result.data);
                if (result.data.colors.length > 0) {
                    setSelectedColor(result.data.colors[0]);
                }
            } else {
                setError('Ürün bulunamadı');
            }
        } catch (err) {
            console.error('Fetch product error:', err);
            setError('Bağlantı hatası oluştu');
        } finally {
            setIsLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    // Computed values - use real API data
    const providerPrices = useMemo(() => {
        if (!product?.provider_prices) { return []; }
        return product.provider_prices.map((p, i) => ({
            id: p.provider_id,
            provider: p.provider_name,
            price: parseFloat(p.current_price),
            originalPrice: parseFloat(p.original_price),
            inStock: p.in_stock,
            rating: parseFloat(p.rating),
            shippingDays: 2 + (i % 3), // Estimated shipping
        })).sort((a, b) => a.price - b.price);
    }, [product?.provider_prices]);

    const priceHistory = useMemo(() => {
        if (!product?.price_history) { return []; }
        return product.price_history.map(p => ({
            date: new Date(p.date).toLocaleDateString('tr-TR'),
            price: parseFloat(p.price),
            provider: p.provider_name,
        }));
    }, [product?.price_history]);

    const lowestPrice = useMemo(() => {
        if (providerPrices.length === 0) { return null; }
        return providerPrices.reduce((min, p) => (p.price < min.price ? p : min), providerPrices[0]);
    }, [providerPrices]);

    const priceStats: PriceStats | null = useMemo(() => {
        if (providerPrices.length === 0) { return null; }
        const prices = providerPrices.map((p) => p.price);
        return {
            min: Math.min(...prices),
            max: Math.max(...prices),
            avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
            current: prices[0], // En düşük fiyat (sıralı olduğu için)
        };
    }, [providerPrices]);

    const discountPercentage = useMemo(() => {
        if (!product?.original_price || !product?.lowest_price) { return product?.discount_percentage || 0; }
        return Math.round(((product.original_price - product.lowest_price) / product.original_price) * 100);
    }, [product]);

    // Handlers
    const handleProviderClick = (provider: ProviderPrice) => {
        const params = new URLSearchParams({
            provider: provider.provider,
            price: provider.price.toString(),
            product: product?.name || '',
        });
        router.push(`/salesPerson?${params.toString()}`);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                    <Text color="muted">Ürün yükleniyor...</Text>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Heading level={2}>Ürün Bulunamadı</Heading>
                    <Text color="muted" className="mt-2">
                        {error || 'Bu ürün mevcut değil veya kaldırılmış olabilir.'}
                    </Text>
                    <Link href="/product">
                        <Button variant="solid" className="mt-4">Ürünlere Dön</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Breadcrumb items
    const breadcrumbItems = [
        { label: 'Ana Sayfa', href: '/' },
        { label: 'Ürünler', href: '/product' },
        { label: product.name },
    ];

    return (
        <div className="min-h-screen bg-background py-8">
            <Container size="lg">
                {/* Breadcrumb */}
                <Breadcrumb items={breadcrumbItems} />

                {/* Ana İçerik */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Sol - Ürün Resmi ve Seçenekler */}
                    <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
                        {/* Ürün Resmi */}
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-background">
                            <Image
                                src={product.image_url || `https://picsum.photos/seed/${product.id}/600/600`}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                            {discountPercentage > 0 && (
                                <div className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-full">
                                    🔥 %{discountPercentage} İndirim
                                </div>
                            )}
                        </div>

                        {/* Renk Seçimi */}
                        <ColorSelector
                            colors={product.colors}
                            selectedColor={selectedColor}
                            onColorSelect={setSelectedColor}
                            className="mt-4"
                        />

                        {/* Beden Seçimi */}
                        <SizeSelector sizes={product.sizes} className="mt-4" />
                    </div>

                    {/* Sağ - Ürün Bilgileri */}
                    <div className="space-y-6">
                        {/* Başlık ve Marka */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Caption>{product.category_name || 'Kategori'}</Caption>
                                {product.gender && product.gender !== 'Unisex' && (
                                    <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full">
                                        {product.gender}
                                    </span>
                                )}
                            </div>
                            <Heading level={1} size="3xl">{product.name}</Heading>
                            {product.brand && (
                                <Text weight="semibold" color="primary" className="mt-2">
                                    {product.brand}
                                </Text>
                            )}
                        </div>

                        {/* Açıklama */}
                        {product.description && (
                            <div className="bg-card rounded-xl p-4 border border-border">
                                <Text size="sm" weight="semibold" className="mb-2">Açıklama</Text>
                                <Text color="muted">{product.description}</Text>
                            </div>
                        )}

                        {/* En İyi Fiyat */}
                        {lowestPrice && (
                            <BestPriceCard
                                price={lowestPrice.price}
                                originalPrice={lowestPrice.originalPrice}
                                provider={lowestPrice.provider}
                                discountPercentage={discountPercentage}
                                inStock={lowestPrice.inStock}
                                onBuyClick={() => handleProviderClick(lowestPrice)}
                            />
                        )}

                        {/* Fiyat İstatistikleri */}
                        {priceStats && <PriceStatsCards stats={priceStats} />}
                    </div>
                </div>

                {/* Satıcı Fiyat Karşılaştırma Tablosu */}
                <ProviderPriceTable
                    prices={providerPrices}
                    onProviderClick={handleProviderClick}
                    className="mt-8"
                />

                {/* Fiyat Geçmişi Grafiği */}
                <PriceHistoryChart
                    data={priceHistory}
                    selectedTimeRange={selectedTimeRange}
                    onTimeRangeChange={setSelectedTimeRange}
                    className="mt-8"
                />

                {/* Geri Dön */}
                <div className="mt-12">
                    <Link
                        href="/product"
                        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <Text weight="medium">Tüm Ürünlere Dön</Text>
                    </Link>
                </div>
            </Container>
        </div>
    );
}
