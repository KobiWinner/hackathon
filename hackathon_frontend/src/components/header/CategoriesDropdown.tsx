'use client';

import { useState } from 'react';

import Link from 'next/link';

import { ChevronDown, Menu } from 'lucide-react';

import { Dropdown } from '@/components/ui/Dropdown';
import { Text } from '@/components/ui/typography/Text';
import { type Category, categories } from '@/data/categories';
import { cn } from '@/lib/cn';

export function CategoriesDropdown() {
    const [activeCategory, setActiveCategory] = useState<Category | null>(null);

    return (
        <Dropdown>
            <Dropdown.Trigger
                className={cn(
                    'flex items-center gap-2.5 px-5 py-3 rounded-xl transition-all duration-200',
                    'bg-gradient-to-r from-primary to-primary-600',
                    'hover:from-primary-600 hover:to-primary-700 hover:shadow-lg hover:shadow-primary/25',
                    'active:scale-[0.98]'
                )}
            >
                <Menu className="h-5 w-5 text-white" />
                <Text as="span" size="base" weight="medium" color="white" className="hidden sm:inline">
                    Kategoriler
                </Text>
                <ChevronDown className="h-5 w-5 text-white" />
            </Dropdown.Trigger>

            <Dropdown.Content
                align="start"
                className="flex p-0 w-auto"
            >
                {/* Ana kategoriler */}
                <div
                    className="w-64 py-3 border-r border-border"
                    onMouseLeave={() => setActiveCategory(null)}
                >
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/category/${category.slug}`}
                            className={cn(
                                'flex items-center gap-3 px-5 py-3 transition-colors',
                                'hover:bg-primary-50',
                                activeCategory?.id === category.id && 'bg-primary-50'
                            )}
                            onMouseEnter={() => setActiveCategory(category)}
                        >
                            <Text
                                as="span"
                                size="base"
                                weight="medium"
                                color={activeCategory?.id === category.id ? 'primary' : 'default'}
                            >
                                {category.name}
                            </Text>
                            {category.subcategories && category.subcategories.length > 0 && (
                                <ChevronDown className="h-4 w-4 ml-auto -rotate-90 text-muted-foreground" />
                            )}
                        </Link>
                    ))}
                </div>

                {/* Alt kategoriler */}
                {activeCategory?.subcategories && activeCategory.subcategories.length > 0 && (
                    <div className="w-64 py-3 bg-muted/30">
                        <Text
                            as="div"
                            size="xs"
                            weight="semibold"
                            color="muted"
                            className="px-5 py-2 uppercase tracking-wider"
                        >
                            {activeCategory.name}
                        </Text>
                        {activeCategory.subcategories.map((sub) => (
                            <Link
                                key={sub.id}
                                href={`/category/${sub.slug}`}
                                className="flex items-center gap-3 px-5 py-3 hover:bg-white transition-colors"
                            >
                                <Text as="span" size="base" color="muted" className="hover:text-primary transition-colors">
                                    {sub.name}
                                </Text>
                            </Link>
                        ))}
                    </div>
                )}
            </Dropdown.Content>
        </Dropdown>
    );
}
