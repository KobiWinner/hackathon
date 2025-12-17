import Link from 'next/link';

import { Text } from '@/components/ui/typography/Text';
import { cn } from '@/lib/cn';

// Statik kategori listesi
const staticCategories = [
    { id: 'kosu-yuruyus', name: 'Koşu/Yürüyüş', emoji: '🏃' },
    { id: 'fitness-kondisyon', name: 'Fitness/Kondisyon', emoji: '💪' },
    { id: 'futbol', name: 'Futbol', emoji: '⚽' },
    { id: 'basketbol', name: 'Basketbol', emoji: '🏀' },
    { id: 'bisiklet', name: 'Bisiklet', emoji: '🚴' },
    { id: 'outdoor-kamp', name: 'Outdoor/Kamp', emoji: '⛺' },
    { id: 'yuzme', name: 'Yüzme', emoji: '🏊' },
    { id: 'kis-sporlari', name: 'Kış Sporları', emoji: '⛷️' },
    { id: 'tenis', name: 'Tenis', emoji: '🎾' },
    { id: 'voleybol', name: 'Voleybol', emoji: '🏐' },
    { id: 'golf', name: 'Golf', emoji: '⛳' },
    { id: 'yoga-pilates', name: 'Yoga/Pilates', emoji: '🧘' },
];

export function CategoryGrid() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {staticCategories.map((category) => (
                <Link
                    key={category.id}
                    href={`/product?category=${encodeURIComponent(category.name)}`}
                    className={cn(
                        'group flex flex-col items-center gap-3 p-4 rounded-2xl',
                        'bg-white border border-border',
                        'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10',
                        'transition-all duration-300'
                    )}
                >
                    {/* Icon placeholder - colored circle */}
                    <div className={cn(
                        'w-14 h-14 rounded-xl flex items-center justify-center',
                        'bg-gradient-to-br from-primary-100 to-secondary-100',
                        'group-hover:from-primary-200 group-hover:to-secondary-200',
                        'transition-colors duration-300'
                    )}>
                        <span className="text-2xl">
                            {category.emoji}
                        </span>
                    </div>
                    <Text
                        as="span"
                        size="sm"
                        weight="medium"
                        align="center"
                        className="group-hover:text-primary transition-colors"
                    >
                        {category.name}
                    </Text>
                </Link>
            ))}
        </div>
    );
}
