'use client';

import { Text } from '@/components/ui/typography/Text';
import { cn } from '@/lib/cn';

export type PriceStats = {
    min: number;
    max: number;
    avg: number;
    current: number;
};

export type PriceStatsCardsProps = {
    stats: PriceStats;
    className?: string;
};

export function PriceStatsCards({ stats, className }: PriceStatsCardsProps) {
    const cards = [
        {
            label: 'En Düşük',
            value: stats.min,
            colorClass: 'text-success',
        },
        {
            label: 'Ortalama',
            value: stats.avg,
            colorClass: '',
        },
        {
            label: 'En Yüksek',
            value: stats.max,
            colorClass: 'text-danger',
        },
        {
            label: 'Şu An',
            value: stats.current,
            colorClass: 'text-primary',
        },
    ];

    return (
        <div className={cn('grid grid-cols-4 gap-3', className)}>
            {cards.map((card) => (
                <div
                    key={card.label}
                    className="bg-card rounded-xl p-3 border border-border text-center"
                >
                    <Text size="xs" color="muted">
                        {card.label}
                    </Text>
                    <Text
                        size="sm"
                        weight="bold"
                        className={card.colorClass}
                    >
                        ₺{card.value.toLocaleString('tr-TR')}
                    </Text>
                </div>
            ))}
        </div>
    );
}
