'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Loader2 } from 'lucide-react';

import { searchService } from '@/api/search';
import type { ProductSearchResult } from '@/api/search';
import { Button } from '@/components/ui/buttons/Button';
import { Container } from '@/components/ui/Container';
import { Caption, Heading, Text } from '@/components/ui/typography/Text';

export default function ProductDetailPage() {
    const params = useParams();
    const productId = Number(params.id);

    // State
    const [product, setProduct] = useState<ProductSearchResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
                        <svg className="w-10 h-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <Heading level={2}>Ürün Bulunamadı</Heading>
                    <Text color="muted" className="mt-2">{error || 'Bu ürün mevcut değil veya kaldırılmış olabilir.'}</Text>
                    <Link href="/product">
                        <Button variant="solid" className="mt-4">Ürünlere Dön</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // İndirim yüzdesini hesapla
    const discountPercentage = product.original_price && product.lowest_price
        ? Math.round(((product.original_price - product.lowest_price) / product.original_price) * 100)
        : product.discount_percentage || 0;

    return (
        <div className="min-h-screen bg-background py-8">
            <Container size="lg">
                {/* Breadcrumb */}
                <nav className="mb-6">
                    <div className="flex items-center gap-2 text-sm">
                        <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Ana Sayfa</Link>
                        <span className="text-muted-foreground">/</span>
                        <Link href="/product" className="text-muted-foreground hover:text-primary transition-colors">Ürünler</Link>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-foreground">{product.name}</span>
                    </div>
                </nav>

                {/* Ana İçerik */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Sol - Ürün Resmi */}
                    <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-background">
                            <Image
                                src={product.image_url || `https://picsum.photos/seed/${product.id}/600/600`}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                            {/* İndirim Badge */}
                            {discountPercentage > 0 && (
                                <div className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-full flex items-center gap-1">
                                    🔥 %{discountPercentage} İndirim
                                </div>
                            )}
                        </div>

                        {/* Özellikler Grid */}
                        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                            {product.colors.length > 0 && (
                                <div className="text-center">
                                    <Text size="sm" color="muted">Renkler</Text>
                                    <div className="flex flex-wrap justify-center gap-1 mt-1">
                                        {product.colors.slice(0, 3).map((color, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                                                {color}
                                            </span>
                                        ))}
                                        {product.colors.length > 3 && (
                                            <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                                                +{product.colors.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                            {product.sizes.length > 0 && (
                                <div className="text-center">
                                    <Text size="sm" color="muted">Bedenler</Text>
                                    <div className="flex flex-wrap justify-center gap-1 mt-1">
                                        {product.sizes.map((size, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full">
                                                {size}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="text-center">
                                <Text size="sm" color="muted">Stok</Text>
                                <div className="mt-1">
                                    {product.in_stock ? (
                                        <span className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full">
                                            ✓ Stokta
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 bg-danger/10 text-danger text-xs rounded-full">
                                            ✗ Tükendi
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
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
                                <div className="flex items-center gap-3 mt-2">
                                    <Text weight="semibold" color="primary">{product.brand}</Text>
                                </div>
                            )}
                        </div>

                        {/* Açıklama */}
                        {product.description && (
                            <div className="bg-card rounded-xl p-4 border border-border">
                                <Text size="sm" weight="semibold" className="mb-2">Açıklama</Text>
                                <Text color="muted">{product.description}</Text>
                            </div>
                        )}

                        {/* Özellikler */}
                        <div className="bg-card rounded-xl p-4 border border-border">
                            <Text size="sm" weight="semibold" className="mb-3">Ürün Özellikleri</Text>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex justify-between items-center py-2 px-3 bg-background rounded-lg">
                                    <Text size="sm" color="muted">Marka</Text>
                                    <Text size="sm" weight="medium">{product.brand || '-'}</Text>
                                </div>
                                <div className="flex justify-between items-center py-2 px-3 bg-background rounded-lg">
                                    <Text size="sm" color="muted">Kategori</Text>
                                    <Text size="sm" weight="medium">{product.category_name || '-'}</Text>
                                </div>
                                <div className="flex justify-between items-center py-2 px-3 bg-background rounded-lg">
                                    <Text size="sm" color="muted">Para Birimi</Text>
                                    <Text size="sm" weight="medium">{product.currency_code}</Text>
                                </div>
                                <div className="flex justify-between items-center py-2 px-3 bg-background rounded-lg">
                                    <Text size="sm" color="muted">Cinsiyet</Text>
                                    <Text size="sm" weight="medium">{product.gender || 'Unisex'}</Text>
                                </div>
                                {product.materials.length > 0 && (
                                    <div className="flex justify-between items-center py-2 px-3 bg-background rounded-lg col-span-2">
                                        <Text size="sm" color="muted">Malzeme</Text>
                                        <Text size="sm" weight="medium">{product.materials.join(', ')}</Text>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Fiyat Bilgisi */}
                        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 border border-primary/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Caption>En Düşük Fiyat</Caption>
                                    <div className="flex items-baseline gap-3 mt-1">
                                        <Text size="3xl" weight="bold" color="primary">
                                            ₺{(product.lowest_price || 0).toLocaleString('tr-TR')}
                                        </Text>
                                        {product.original_price && product.original_price > (product.lowest_price || 0) && (
                                            <Text size="lg" color="muted" lineThrough>
                                                ₺{product.original_price.toLocaleString('tr-TR')}
                                            </Text>
                                        )}
                                    </div>
                                    {discountPercentage > 0 && (
                                        <Text size="sm" className="text-success mt-1">
                                            %{discountPercentage} tasarruf edin!
                                        </Text>
                                    )}
                                </div>
                                <Button variant="gradient" size="lg" disabled={!product.in_stock}>
                                    {product.in_stock ? 'Satın Al' : 'Stokta Yok'}
                                </Button>
                            </div>
                        </div>

                        {/* Bilgi Notu */}
                        <div className="bg-card rounded-xl p-4 border border-border">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">💡</span>
                                <div>
                                    <Text size="sm" weight="semibold">Fiyat Karşılaştırma</Text>
                                    <Text size="sm" color="muted">
                                        Bu fiyat, farklı satıcılar arasındaki en düşük fiyatı gösterir.
                                        Satın almadan önce stok durumunu kontrol etmenizi öneririz.
                                    </Text>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Benzer Ürünler - İleride eklenebilir */}
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
