'use client';

import { Button } from '@/components/ui/buttons/Button';
import { Caption, Text } from '@/components/ui/typography/Text';
import { cn } from '@/lib/cn';

export type BestPriceCardProps = {
    price: number;
    originalPrice?: number;
    provider: string;
    discountPercentage?: number;
    inStock: boolean;
    onBuyClick?: () => void;
    className?: string;
};

export function BestPriceCard({
    price,
    originalPrice,
    provider,
    discountPercentage = 0,
    inStock,
    onBuyClick,
    className,
}: BestPriceCardProps) {
    return (
        <div
            className={cn(
                'bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 border border-primary/20',
                className
            )}
        >
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Caption>En Düşük Fiyat</Caption>
                        <span className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full font-medium">
                            {provider}
                        </span>
                    </div>
                    <div className="flex items-baseline gap-3 mt-1">
                        <Text size="3xl" weight="bold" color="primary">
                            ₺{price.toLocaleString('tr-TR')}
                        </Text>
                        {originalPrice && originalPrice > price && (
                            <Text size="lg" color="muted" lineThrough>
                                ₺{originalPrice.toLocaleString('tr-TR')}
                            </Text>
                        )}
                    </div>
                    {discountPercentage > 0 && (
                        <Text size="sm" className="text-success mt-1">
                            %{discountPercentage} tasarruf edin!
                        </Text>
                    )}
                </div>
                <Button
                    variant="gradient"
                    size="lg"
                    disabled={!inStock}
                    onClick={onBuyClick}
                >
                    {inStock ? 'Satıcıya Git' : 'Stokta Yok'}
                </Button>
            </div>
        </div>
    );
}
