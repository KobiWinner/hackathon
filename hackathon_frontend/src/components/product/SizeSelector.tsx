'use client';

import { Text } from '@/components/ui/typography/Text';
import { cn } from '@/lib/cn';

export type SizeSelectorProps = {
    sizes: string[];
    selectedSize?: string | null;
    onSizeSelect?: (size: string) => void;
    className?: string;
};

export function SizeSelector({
    sizes,
    selectedSize,
    onSizeSelect,
    className,
}: SizeSelectorProps) {
    if (sizes.length === 0) return null;

    const isInteractive = !!onSizeSelect;

    return (
        <div className={cn('pt-4 border-t border-border', className)}>
            <Text size="sm" weight="semibold" className="mb-3">
                Beden
            </Text>
            <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                    <button
                        key={size}
                        onClick={() => onSizeSelect?.(size)}
                        disabled={!isInteractive}
                        className={cn(
                            'px-3 py-1.5 text-sm rounded-lg font-medium transition-all',
                            isInteractive && 'cursor-pointer',
                            selectedSize === size
                                ? 'bg-secondary text-white'
                                : 'bg-secondary/10 text-secondary',
                            isInteractive && selectedSize !== size && 'hover:bg-secondary/20'
                        )}
                    >
                        {size}
                    </button>
                ))}
            </div>
        </div>
    );
}
