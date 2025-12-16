import Link from 'next/link';

import { Text } from '@/components/ui/typography/Text';
import { cn } from '@/lib/cn';

type HeroBannerProps = {
    className?: string;
};

export function HeroBanner({ className }: HeroBannerProps) {
    return (
        <div className={cn(
            'relative overflow-hidden rounded-3xl',
            'bg-gradient-to-r from-primary via-primary-600 to-secondary',
            'p-8 md:p-12 lg:p-16',
            className
        )}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="relative z-10 max-w-2xl">
                <Text as="span" size="sm" weight="semibold" color="white" className="uppercase tracking-wider opacity-90">
                    Spor Ürünleri Fiyat Karşılaştırma
                </Text>
                <Text as="h1" size="4xl" weight="bold" color="white" className="mt-2">
                    En Ucuz Fiyatı Bul, Tasarruf Et!
                </Text>
                <Text size="lg" color="white" className="mt-4 opacity-90 max-w-xl">
                    Binlerce spor ürününü farklı satıcılardan karşılaştır.
                    En uygun fiyatı anında bul, tasarruf et!
                </Text>
                <div className="flex flex-wrap gap-4 mt-8">
                    <Link
                        href="/category/kosu-yuruyus"
                        className={cn(
                            'px-6 py-3 rounded-xl font-semibold',
                            'bg-white text-primary',
                            'hover:bg-white/90 transition-colors',
                            'shadow-lg shadow-black/10'
                        )}
                    >
                        Fiyatları Karşılaştır
                    </Link>
                    <Link
                        href="/fiyat-dusuler"
                        className={cn(
                            'px-6 py-3 rounded-xl font-semibold',
                            'bg-white/20 text-white border border-white/30',
                            'hover:bg-white/30 transition-colors'
                        )}
                    >
                        Fiyat Düşenler
                    </Link>
                </div>
            </div>
        </div>
    );
}
