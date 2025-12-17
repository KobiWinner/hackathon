'use client';

import { Button } from '@/components/ui/buttons/Button';
import { Heading, Text } from '@/components/ui/typography/Text';
import { cn } from '@/lib/cn';

export type ProviderPrice = {
    id: number;
    provider: string;
    logo?: string;
    price: number;
    originalPrice?: number;
    inStock: boolean;
    rating: number;
    shippingDays: number;
    url?: string;
};

export type ProviderPriceTableProps = {
    prices: ProviderPrice[];
    onProviderClick?: (provider: ProviderPrice) => void;
    className?: string;
};

export function ProviderPriceTable({
    prices,
    onProviderClick,
    className,
}: ProviderPriceTableProps) {
    if (prices.length === 0) {
        return (
            <div className={cn('bg-card rounded-2xl p-6 border border-border text-center', className)}>
                <Text color="muted">Satıcı bilgisi bulunamadı.</Text>
            </div>
        );
    }

    return (
        <div className={cn('bg-card rounded-2xl p-6 shadow-lg border border-border', className)}>
            <div className="flex items-center justify-between mb-4">
                <Heading level={2} size="xl">
                    Satıcı Fiyat Karşılaştırması
                </Heading>
                <Text size="sm" color="muted">
                    {prices.length} satıcı
                </Text>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left py-3 px-4">
                                <Text size="sm" weight="semibold" color="muted">
                                    Satıcı
                                </Text>
                            </th>
                            <th className="text-left py-3 px-4">
                                <Text size="sm" weight="semibold" color="muted">
                                    Fiyat
                                </Text>
                            </th>
                            <th className="text-left py-3 px-4">
                                <Text size="sm" weight="semibold" color="muted">
                                    Stok
                                </Text>
                            </th>
                            <th className="text-left py-3 px-4">
                                <Text size="sm" weight="semibold" color="muted">
                                    Puan
                                </Text>
                            </th>
                            <th className="text-left py-3 px-4">
                                <Text size="sm" weight="semibold" color="muted">
                                    Kargo
                                </Text>
                            </th>
                            <th className="text-right py-3 px-4">
                                <Text size="sm" weight="semibold" color="muted">
                                    İşlem
                                </Text>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {prices.map((priceInfo, index) => (
                            <tr
                                key={priceInfo.id}
                                className={cn(
                                    'border-b border-border/50 hover:bg-background/50 transition-colors',
                                    index === 0 && 'bg-primary/5'
                                )}
                            >
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                            <Text size="sm" weight="bold">
                                                {priceInfo.provider[0]}
                                            </Text>
                                        </div>
                                        <div>
                                            <Text weight="medium">{priceInfo.provider}</Text>
                                            {index === 0 && (
                                                <span className="text-xs text-success font-medium">
                                                    En Ucuz
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-baseline gap-2">
                                        <Text
                                            weight="bold"
                                            color={index === 0 ? 'primary' : 'default'}
                                        >
                                            ₺{priceInfo.price.toLocaleString('tr-TR')}
                                        </Text>
                                        {priceInfo.originalPrice &&
                                            priceInfo.originalPrice > priceInfo.price && (
                                                <Text size="xs" color="muted" lineThrough>
                                                    ₺{priceInfo.originalPrice.toLocaleString('tr-TR')}
                                                </Text>
                                            )}
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    {priceInfo.inStock ? (
                                        <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">
                                            Stokta
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 bg-danger/10 text-danger text-xs rounded-full">
                                            Tükendi
                                        </span>
                                    )}
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-1">
                                        <span className="text-warning">★</span>
                                        <Text size="sm">{priceInfo.rating}</Text>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <Text size="sm" color="muted">
                                        {priceInfo.shippingDays} gün
                                    </Text>
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <Button
                                        variant={
                                            priceInfo.inStock
                                                ? index === 0
                                                    ? 'gradient'
                                                    : 'solid'
                                                : 'ghost'
                                        }
                                        size="sm"
                                        disabled={!priceInfo.inStock}
                                        onClick={() => onProviderClick?.(priceInfo)}
                                    >
                                        {priceInfo.inStock ? 'Git' : 'Bekle'}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
