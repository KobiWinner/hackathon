'use client';

import { useMemo, useState } from 'react';

import { ProductCard } from '@/components/product';
import type { Product } from '@/data/products';

import { SectionHeader } from './SectionHeader';

type ProductSectionProps = {
    title: string;
    products: Product[];
    viewAllHref?: string;
    showFilter?: boolean;
};

export function ProductSection({ title, products, viewAllHref, showFilter = false }: ProductSectionProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Kategorileri çıkar
    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category));
        return ['all', ...Array.from(cats)];
    }, [products]);

    // Filtrelenmiş ürünler
    const filteredProducts = useMemo(() => {
        if (selectedCategory === 'all') {
            return products;
        }
        return products.filter(p => p.category === selectedCategory);
    }, [products, selectedCategory]);

    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <SectionHeader
                    title={title}
                    viewAllHref={viewAllHref}
                    className="mb-0"
                />

                {showFilter && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground hidden sm:inline">Kategori:</span>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-3 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="all">Tümü</option>
                            {categories.filter(cat => cat !== 'all').map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                {filteredProducts.slice(0, 10).map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {showFilter && filteredProducts.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Bu kategoride ürün bulunamadı.</p>
                </div>
            )}
        </section>
    );
}
