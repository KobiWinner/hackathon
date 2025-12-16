'use client';

import { useState, useEffect } from 'react';
import { SiteHeader } from './site/Header';
import { SiteFooter } from './site/Footer';

interface SiteLayoutProps {
    children: React.ReactNode;
}

export function SiteLayout({ children }: SiteLayoutProps) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="flex min-h-screen flex-col">
            {/* Sticky Header Wrapper */}
            <div className="sticky top-0 z-50 px-4 pt-4 lg:px-8">
                <SiteHeader isScrolled={isScrolled} />
            </div>

            {/* Main Content */}
            <main className="flex-1 px-4 py-8 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <div className="px-4 pb-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <SiteFooter />
                </div>
            </div>
        </div>
    );
}
