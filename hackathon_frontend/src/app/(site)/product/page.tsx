'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Caption, Heading, Text } from '@/components/ui/typography/Text';

// Mock ürün verisi - [id]/page.tsx ile aynı
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
];

export default function ProductListPage() {
    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Başlık */}
                <div className="mb-8">
                    <Heading level={1} size="3xl">Ürünler</Heading>
                    <Text color="muted" className="mt-2">
                        Tüm ürünleri incele, fiyat karşılaştır ve en iyi fırsatları yakala!
                    </Text>
                </div>

                {/* Ürün Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {mockProducts.map((product) => (
                        <Link
                            key={product.id}
                            href={`/product/${product.id}`}
                            className="block bg-card rounded-2xl p-4 border border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 group"
                        >
                            {/* Ürün Resmi */}
                            <div className="relative aspect-square rounded-xl overflow-hidden bg-background mb-4">
                                <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                />
                                {/* Trend Badge */}
                                {product.trendScore >= 85 && (
                                    <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                                        🔥 Trend
                                    </div>
                                )}
                            </div>

                            {/* Ürün Bilgileri */}
                            <div>
                                <Caption>{product.category}</Caption>
                                <Text size="base" weight="semibold" maxLines={2} className="mt-1 mb-1 group-hover:text-primary transition-colors">
                                    {product.name}
                                </Text>
                                <Text size="sm" color="muted">{product.brand}</Text>

                                {/* Fiyat */}
                                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                                    <div>
                                        <Caption>En düşük fiyat</Caption>
                                        <Text size="lg" weight="bold" color="primary">
                                            ₺{product.minPrice.toLocaleString()}
                                        </Text>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
