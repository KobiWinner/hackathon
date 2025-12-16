'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Text } from '@/components/ui/typography/Text';
import type { Product } from '@/data/products';
import { cn } from '@/lib/cn';

type ProductCardProps = {
    product: Product;
    className?: string;
};

export function ProductCard({ product, className }: ProductCardProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <Link
            href={`/product/${product.slug}`}
            className={cn(
                'group block bg-white rounded-2xl overflow-hidden',
                'border border-border hover:border-primary/30',
                'shadow-sm hover:shadow-lg hover:shadow-primary/10',
                'transition-all duration-300',
                className
            )}
        >
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-muted">
                <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Fiyat Düşüşü Badge */}
                {product.priceDropPercent && product.priceDropPercent > 0 && (
                    <div className="absolute top-3 left-3 bg-success text-white px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <span>↓</span>
                        <Text as="span" size="xs" weight="bold" color="white">
                            %{product.priceDropPercent}
                        </Text>
                    </div>
                )}

                {/* Satıcı Sayısı Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                    <Text as="span" size="xs" weight="medium" color="primary">
                        {product.sellerCount} satıcı
                    </Text>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Brand */}
                <Text size="xs" weight="medium" color="primary" className="uppercase tracking-wide">
                    {product.brand}
                </Text>

                {/* Title */}
                <Text
                    size="sm"
                    weight="medium"
                    className="mt-1 line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors"
                >
                    {product.title}
                </Text>

                {/* Rating */}
                {product.rating && (
                    <div className="flex items-center gap-1.5 mt-2">
                        <div className="flex items-center gap-0.5">
                            <span className="text-warning">★</span>
                            <Text as="span" size="xs" weight="medium">
                                {product.rating}
                            </Text>
                        </div>
                        <Text as="span" size="xs" color="muted">
                            ({product.reviewCount})
                        </Text>
                    </div>
                )}

                {/* Price Range */}
                <div className="mt-3">
                    <div className="flex items-baseline gap-2">
                        <Text size="lg" weight="bold" color="primary">
                            {formatPrice(product.lowestPrice)}
                        </Text>
                        {product.highestPrice > product.lowestPrice && (
                            <Text size="xs" color="muted">
                                - {formatPrice(product.highestPrice)}
                            </Text>
                        )}
                    </div>
                    <Text size="xs" color="muted" className="mt-1">
                        {product.sellerCount} satıcıdan fiyatları karşılaştır
                    </Text>
                </div>
            </div>
        </Link>
    );
}
