'use client';

import { useMemo } from 'react';

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { Heading, Text } from '@/components/ui/typography/Text';
import { cn } from '@/lib/cn';

// Zaman aralığı seçenekleri
export const TIME_RANGES = [
    { key: '1w', label: '1 Hafta', days: 7 },
    { key: '1m', label: '1 Ay', days: 30 },
    { key: '3m', label: '3 Ay', days: 90 },
    { key: '6m', label: '6 Ay', days: 180 },
    { key: '1y', label: '1 Yıl', days: 365 },
] as const;

export type TimeRangeKey = (typeof TIME_RANGES)[number]['key'];

export type PriceHistoryData = {
    date: string;
    price: number;
    provider?: string;
};

export type PriceHistoryChartProps = {
    data: PriceHistoryData[];
    selectedTimeRange: TimeRangeKey;
    onTimeRangeChange: (range: TimeRangeKey) => void;
    className?: string;
};

export function PriceHistoryChart({
    data,
    selectedTimeRange,
    onTimeRangeChange,
    className,
}: PriceHistoryChartProps) {
    // Fiyat istatistikleri
    const stats = useMemo(() => {
        if (data.length === 0) {return null;}
        const prices = data.map((p) => p.price);
        return {
            min: Math.min(...prices),
            max: Math.max(...prices),
            avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
            current: prices[prices.length - 1],
        };
    }, [data]);

    return (
        <div
            className={cn(
                'bg-card rounded-2xl p-6 shadow-lg border border-border',
                className
            )}
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <Heading level={2} size="xl">
                        Fiyat Geçmişi
                    </Heading>
                    <Text size="sm" color="muted" className="mt-1">
                        Fiyat değişimlerini takip edin
                    </Text>
                </div>
                <div className="flex flex-wrap gap-2">
                    {TIME_RANGES.map((range) => (
                        <button
                            key={range.key}
                            onClick={() => onTimeRangeChange(range.key)}
                            className={cn(
                                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                                selectedTimeRange === range.key
                                    ? 'bg-primary text-white'
                                    : 'bg-muted/10 text-muted-foreground hover:bg-muted/20'
                            )}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            {data.length > 0 ? (
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor="hsl(var(--primary))"
                                        stopOpacity={0.3}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="hsl(var(--primary))"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="hsl(var(--border))"
                            />
                            <XAxis
                                dataKey="date"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `₺${value}`}
                                domain={['dataMin - 50', 'dataMax + 50']}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                }}
                                formatter={(value) => {
                                    const numValue = typeof value === 'number' ? value : 0;
                                    return [`₺${numValue.toLocaleString('tr-TR')}`, 'Fiyat'];
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="price"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                fill="url(#priceGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-[300px] flex items-center justify-center">
                    <Text color="muted">Fiyat geçmişi verisi bulunamadı.</Text>
                </div>
            )}

            {/* Stats Footer */}
            {stats && (
                <div className="mt-4 p-4 bg-muted/10 rounded-xl flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <div>
                            <Text size="xs" color="muted">
                                Dönem En Düşük
                            </Text>
                            <Text size="sm" weight="bold" className="text-success">
                                ₺{stats.min.toLocaleString('tr-TR')}
                            </Text>
                        </div>
                        <div>
                            <Text size="xs" color="muted">
                                Dönem En Yüksek
                            </Text>
                            <Text size="sm" weight="bold" className="text-danger">
                                ₺{stats.max.toLocaleString('tr-TR')}
                            </Text>
                        </div>
                        <div>
                            <Text size="xs" color="muted">
                                Fark
                            </Text>
                            <Text size="sm" weight="bold">
                                ₺{(stats.max - stats.min).toLocaleString('tr-TR')}
                            </Text>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Mock veri üretici fonksiyon - API entegrasyonu olduğunda kaldırılacak
export function generateMockPriceHistory(
    basePrice: number,
    days: number
): PriceHistoryData[] {
    const data: PriceHistoryData[] = [];
    const now = new Date();

    for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Fiyat değişimi simülasyonu
        const fluctuation = Math.sin(i * 0.1) * 0.1 + (Math.random() - 0.5) * 0.05;
        const price = Math.round(basePrice * (1 + fluctuation));

        data.push({
            date: date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }),
            price,
            provider: 'En Düşük',
        });
    }

    return data;
}
