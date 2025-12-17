'use client';

import Link from 'next/link';

import { cn } from '@/lib/cn';

export type BreadcrumbItem = {
    label: string;
    href?: string;
};

export type BreadcrumbProps = {
    items: BreadcrumbItem[];
    className?: string;
};

export function Breadcrumb({ items, className }: BreadcrumbProps) {
    return (
        <nav className={cn('mb-6', className)}>
            <div className="flex items-center gap-2 text-sm">
                {items.map((item, index) => (
                    <span key={index} className="flex items-center gap-2">
                        {index > 0 && (
                            <span className="text-muted-foreground">/</span>
                        )}
                        {item.href ? (
                            <Link
                                href={item.href}
                                className="text-muted-foreground hover:text-primary transition-colors"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-foreground">{item.label}</span>
                        )}
                    </span>
                ))}
            </div>
        </nav>
    );
}
