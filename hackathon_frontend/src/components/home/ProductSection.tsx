import { ProductCard } from '@/components/product';
import type { Product } from '@/data/products';

import { SectionHeader } from './SectionHeader';

type ProductSectionProps = {
    title: string;
    products: Product[];
    viewAllHref?: string;
};

export function ProductSection({ title, products, viewAllHref }: ProductSectionProps) {
    return (
        <section>
            <SectionHeader
                title={title}
                viewAllHref={viewAllHref}
                className="mb-6"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                {products.slice(0, 10).map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
}
