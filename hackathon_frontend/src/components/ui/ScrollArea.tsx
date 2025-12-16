'use client';

import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type ScrollOrientation = 'vertical' | 'horizontal' | 'both';

type ScrollAreaProps = {
    children: ReactNode;
    className?: string;
    /** true ise scrollbar tamamen gizlenir */
    hideScrollbar?: boolean;
    /** Scroll yönü - vertical, horizontal veya both */
    orientation?: ScrollOrientation;
};

/**
 * Özelleştirilmiş scrollbar ile scroll alanı bileşeni.
 * Tailwind arbitrary variants kullanarak webkit scrollbar styling.
 * 
 * Özellikler:
 * - Oklar yok (scrollbar-button gizli)
 * - En sağa/alta yaslı
 * - Primary renk paleti (4px genişlik)
 * - Vertical, horizontal veya her iki yön desteği
 */
export function ScrollArea({
    children,
    className,
    hideScrollbar = false,
    orientation = 'vertical',
}: ScrollAreaProps) {
    // Overflow sınıflarını belirle
    const overflowClasses = {
        vertical: 'overflow-y-auto overflow-x-hidden',
        horizontal: 'overflow-x-auto overflow-y-hidden',
        both: 'overflow-auto',
    };

    // Scrollbar stillerini oluştur
    const scrollbarStyles = hideScrollbar
        ? "scrollbar-none [&::-webkit-scrollbar]:hidden"
        : cn(
            // Vertical scrollbar genişliği
            "[&::-webkit-scrollbar]:w-1",
            // Horizontal scrollbar yüksekliği
            "[&::-webkit-scrollbar]:h-1",
            // Track (arka plan) - transparent
            "[&::-webkit-scrollbar-track]:bg-transparent",
            // Thumb (kaydırıcı) - primary renkleri
            "[&::-webkit-scrollbar-thumb]:bg-primary-300",
            "[&::-webkit-scrollbar-thumb]:rounded-full",
            "[&::-webkit-scrollbar-thumb]:hover:bg-primary-400",
            "[&::-webkit-scrollbar-thumb]:active:bg-primary-500",
            // Okları (butonları) gizle
            "[&::-webkit-scrollbar-button]:hidden",
            "[&::-webkit-scrollbar-button]:h-0",
            "[&::-webkit-scrollbar-button]:w-0",
            // Corner gizle
            "[&::-webkit-scrollbar-corner]:bg-transparent"
        );

    return (
        <div
            className={cn(
                overflowClasses[orientation],
                scrollbarStyles,
                className
            )}
            style={
                hideScrollbar
                    ? { scrollbarWidth: 'none' }
                    : {
                        // Firefox scrollbar
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#83c7ff transparent',
                    }
            }
        >
            {children}
        </div>
    );
}
