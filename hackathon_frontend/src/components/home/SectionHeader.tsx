import Link from 'next/link';

import { Text } from '@/components/ui/typography/Text';
import { cn } from '@/lib/cn';

type SectionHeaderProps = {
    title: string;
    viewAllHref?: string;
    viewAllText?: string;
    className?: string;
};

export function SectionHeader({
    title,
    viewAllHref,
    viewAllText = 'Tümünü Gör',
    className
}: SectionHeaderProps) {
    return (
        <div className={cn('flex items-center justify-between', className)}>
            <Text as="h2" size="2xl" weight="bold">
                {title}
            </Text>
            {viewAllHref && (
                <Link
                    href={viewAllHref}
                    className="text-primary hover:text-primary-600 font-medium transition-colors"
                >
                    {viewAllText} →
                </Link>
            )}
        </div>
    );
}
