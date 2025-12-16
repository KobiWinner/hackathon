'use client';

import type { ReactNode } from "react";

import { useScroll } from "@/hooks";
import { SiteFooter } from "@/layout/site/Footer";
import { SiteHeader } from "@/layout/site/Header";

export default function SiteLayout({ children }: { children: ReactNode }) {
    const { isScrolled } = useScroll({ threshold: 10 });

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            {/* Header - Fixed position */}
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-[padding] duration-500 ease-out ${isScrolled ? "px-4 pt-4 lg:px-8" : ""
                    }`}
            >
                <SiteHeader isScrolled={isScrolled} />
            </header>
            {/* Main content - no padding top, hero handles it */}
            <main className="flex-1">{children}</main>
            {/* Footer - full width background, centered content */}
            <footer className="mt-auto w-full border-t border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
                    <SiteFooter />
                </div>
            </footer>
        </div>
    );
}
