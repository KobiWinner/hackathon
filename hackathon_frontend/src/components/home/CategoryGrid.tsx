import Link from 'next/link';

import { Text } from '@/components/ui/typography/Text';
import { categories } from '@/data/categories';
import { cn } from '@/lib/cn';

export function CategoryGrid() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category) => (
                <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
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
                            {getCategoryEmoji(category.slug)}
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

function getCategoryEmoji(slug: string): string {
    const emojiMap: Record<string, string> = {
        'kosu-yuruyus': '🏃',
        'fitness-kondisyon': '💪',
        'futbol': '⚽',
        'basketbol': '🏀',
        'bisiklet': '🚴',
        'outdoor-kamp': '⛺',
        'yuzme': '🏊',
        'kis-sporlari': '⛷️',
    };
    return emojiMap[slug] || '🏆';
}
