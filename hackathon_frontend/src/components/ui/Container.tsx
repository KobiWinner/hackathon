import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type ContainerProps = {
    children: ReactNode;
    className?: string;
    /** Container genişliği */
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    /** Padding yok */
    noPadding?: boolean;
};

const sizeClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
};

export function Container({
    children,
    className,
    size = 'xl',
    noPadding = false,
}: ContainerProps) {
    return (
        <div
            className={cn(
                'mx-auto w-full',
                sizeClasses[size],
                !noPadding && 'px-4 sm:px-6 lg:px-8',
                className
            )}
        >
            {children}
        </div>
    );
}
