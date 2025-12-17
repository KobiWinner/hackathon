'use client';

import { Text } from '@/components/ui/typography/Text';
import { cn } from '@/lib/cn';

export type ColorSelectorProps = {
    colors: string[];
    selectedColor: string | null;
    onColorSelect: (color: string) => void;
    className?: string;
};

export function ColorSelector({
    colors,
    selectedColor,
    onColorSelect,
    className,
}: ColorSelectorProps) {
    if (colors.length === 0) return null;

    return (
        <div className={cn('pt-4 border-t border-border', className)}>
            <Text size="sm" weight="semibold" className="mb-3">
                Renk Seçimi
            </Text>
            <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                    <button
                        key={color}
                        onClick={() => onColorSelect(color)}
                        className={cn(
                            'px-4 py-2 rounded-lg border-2 transition-all duration-200',
                            selectedColor === color
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border hover:border-primary/50'
                        )}
                    >
                        <Text
                            size="sm"
                            weight={selectedColor === color ? 'semibold' : 'normal'}
                        >
                            {color}
                        </Text>
                    </button>
                ))}
            </div>
            {selectedColor && (
                <div className="mt-3 p-3 bg-primary/5 rounded-lg">
                    <Text size="sm" color="muted">
                        <span className="font-semibold text-foreground">
                            {selectedColor}
                        </span>{' '}
                        rengi için fiyatlar aşağıda gösterilmektedir.
                    </Text>
                </div>
            )}
        </div>
    );
}
