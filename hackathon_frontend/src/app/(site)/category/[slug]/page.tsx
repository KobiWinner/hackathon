'use client';

import { Suspense, useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

import { ChevronLeft, ChevronRight, Filter, Loader2, Package, X } from 'lucide-react';

import {
    type CategoryProduct,
    type CategoryWithProductsResponse,
    categoryService,
} from '@/api/categories';
import { Button } from '@/components/ui/buttons/Button';
import { Skeleton } from '@/components/ui/feedback/Skeleton';
import { Heading, Text } from '@/components/ui/typography/Text';
import { cn } from '@/lib/cn';

// Ürün kartı
function ProductCard({ product }: { product: CategoryProduct }) {
    const discountPercentage = product.discount_percentage;

    return (
        <Link
            href={`/product/${product.slug || product.id}`}
            className="group block bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300"
        >
            {/* Ürün Görseli */}
            <div className="relative aspect-square bg-muted overflow-hidden">
                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-muted-foreground" />
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

// Pagination component
function Pagination({
    currentPage,
    totalPages,
    onPageChange,
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) {
    if (totalPages <= 1) { return null; }

    const pages: (number | 'ellipsis')[] = [];

    // Her zaman ilk sayfayı göster
    pages.push(1);

    // Ortadaki sayfalar
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) {
        pages.push('ellipsis');
    }

    for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
            pages.push(i);
        }
    }

    if (end < totalPages - 1) {
        pages.push('ellipsis');
    }

    // Her zaman son sayfayı göster
    if (totalPages > 1 && !pages.includes(totalPages)) {
        pages.push(totalPages);
    }

    return (
        <div className="flex items-center justify-center gap-2 mt-12">
            <Button
                variant="ghost"
                size="sm"
                icon={<ChevronLeft className="w-4 h-4" />}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
            />

            {pages.map((page, index) => (
                page === 'ellipsis' ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">...</span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={cn(
                            'w-10 h-10 rounded-lg text-sm font-medium transition-colors',
                            page === currentPage
                                ? 'bg-primary text-white'
                                : 'hover:bg-muted'
                        )}
                    >
                        {page}
                    </button>
                )
            ))}

            <Button
                variant="ghost"
                size="sm"
                icon={<ChevronRight className="w-4 h-4" />}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
            />
        </div>
    );
}

// Ana içerik componenti
function CategoryContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const slug = params.slug as string;
    const currentPage = Number(searchParams.get('page')) || 1;

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<CategoryWithProductsResponse | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Kategori ve ürünleri yükle
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            const result = await categoryService.getWithProducts(slug, {
                page: currentPage,
                page_size: 24,
            });

            if (!isMounted) { return; }

            if (result.success) {
                setData(result.data);
            } else {
                setError(result.error.message);
            }

            setIsLoading(false);
        };

        void fetchData();

        return () => {
            isMounted = false;
        };
    }, [slug, currentPage]);

    // Sayfa değiştir
    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(page));
        router.push(`/category/${slug}?${params.toString()}`);
    };

    // Yükleniyor
    if (isLoading) {
        return (
            <div>
                <div className="mb-8">
                    <Skeleton className="h-10 w-48 mb-2" />
                    <Skeleton className="h-5 w-32" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <ProductSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    // Hata
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center mb-6">
                    <X className="w-10 h-10 text-danger" />
                </div>
                <Heading level={2} size="xl" align="center">
                    Kategori bulunamadı
                </Heading>
                <Text color="muted" align="center" className="mt-2">
                    {error}
                </Text>
                <Button
                    variant="solid"
                    txt="Ana Sayfaya Dön"
                    className="mt-6"
                    onClick={() => router.push('/')}
                />
            </div>
        );
    }

    // Veri yok
    if (!data) {
        return null;
    }

    return (
        <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm mb-6">
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                    Ana Sayfa
                </Link>
                <span className="text-muted-foreground">/</span>
                <span className="text-foreground font-medium">{data.category.name}</span>
            </div>

            {/* Başlık ve Filtreler */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <Heading level={1} size="2xl">
                        {data.category.name}
                    </Heading>
                    <Text color="muted" className="mt-1">
                        {data.total} ürün bulundu
                    </Text>
                </div>

                <Button
                    variant="ghost"
                    icon={<Filter className="w-4 h-4" />}
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

            {/* Ürünler */}
            {data.products.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {data.products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {/* Sayfalama */}
                    <Pagination
                        currentPage={data.page}
                        totalPages={data.total_pages}
                        onPageChange={handlePageChange}
                    />
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                        <Package className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <Heading level={2} size="xl" align="center">
                        Bu kategoride ürün yok
                    </Heading>
                    <Text color="muted" align="center" className="mt-2 max-w-md">
                        Bu kategoride henüz ürün bulunmuyor. Daha sonra tekrar kontrol edin.
                    </Text>
                </div>
            )}
        </div>
    );
}

// Ana sayfa componenti
export default function CategoryPage() {
    return (
        <div className="pt-24 pb-12 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                <Suspense fallback={
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                }>
                    <CategoryContent />
                </Suspense>
            </div>
        </div>
    );
}
