"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { CustomerServiceFAB } from "@/components/CustomerServiceFAB";
import { Button } from "@/components/ui/buttons/Button";
import { Heading, Text } from "@/components/ui/typography/Text";
import { useScroll } from "@/hooks";
import { SiteFooter } from "@/layout/site/Footer";
import { SiteHeader } from "@/layout/site/Header";

// 404 ikonu - kayıp dosya/sayfa
function NotFoundIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Klasör gövdesi */}
            <path
                d="M15 35C15 30.5817 18.5817 27 23 27H45L55 37H97C101.418 37 105 40.5817 105 45V90C105 94.4183 101.418 98 97 98H23C18.5817 98 15 94.4183 15 90V35Z"
                className="fill-primary-100 stroke-primary-300"
                strokeWidth="2"
            />
            {/* Klasör üst kapak */}
            <path
                d="M15 35C15 30.5817 18.5817 27 23 27H45L55 37H23C18.5817 37 15 33.4183 15 29V35Z"
                className="fill-primary-200"
            />
            {/* Soru işareti */}
            <circle cx="60" cy="65" r="25" className="fill-white/80" />
            <text
                x="60"
                y="75"
                textAnchor="middle"
                className="fill-primary-500 text-3xl font-bold"
                fontSize="36"
            >
                ?
            </text>
            {/* Küçük dekoratif daireler */}
            <circle cx="25" cy="20" r="4" className="fill-secondary-300 opacity-60" />
            <circle cx="95" cy="25" r="3" className="fill-accent-300 opacity-60" />
            <circle cx="100" cy="100" r="5" className="fill-primary-300 opacity-40" />
        </svg>
    );
}

// Ev ikonu
function HomeIcon() {
    return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
        </svg>
    );
}

// Geri ok ikonu
function ArrowLeftIcon() {
    return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
        </svg>
    );
}

export default function NotFound() {
    const [mounted, setMounted] = useState(false);
    const { isScrolled } = useScroll({ threshold: 10 });

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            {/* Header */}
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-[padding] duration-500 ease-out ${isScrolled ? "px-4 pt-4 lg:px-8" : ""
                    }`}
            >
                <SiteHeader isScrolled={isScrolled} />
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center pt-20 pb-12 px-4">
                <div className="max-w-2xl w-full text-center">
                    {/* Animated Icon */}
                    <div
                        className={`mb-8 transition-all duration-700 ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-90"
                            }`}
                    >
                        <NotFoundIcon className="w-40 h-40 md:w-52 md:h-52 mx-auto" />
                    </div>

                    {/* 404 Badge */}
                    <div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-200 mb-6 transition-all duration-500 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                            }`}
                    >
                        <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                        <Text size="sm" weight="medium" color="primary">
                            Hata 404
                        </Text>
                    </div>

                    {/* Heading */}
                    <div
                        className={`mb-4 transition-all duration-500 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                            }`}
                    >
                        <Heading level={1} size="3xl" align="center">
                            Sayfa Bulunamadı
                        </Heading>
                    </div>

                    {/* Description */}
                    <div
                        className={`mb-10 max-w-md mx-auto transition-all duration-500 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                            }`}
                    >
                        <Text size="lg" color="muted" align="center">
                            Aradığınız sayfa mevcut değil, taşınmış veya silinmiş olabilir.
                            Ana sayfaya dönerek aradığınızı bulmayı deneyebilirsiniz.
                        </Text>
                    </div>

                    {/* Action Buttons */}
                    <div
                        className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-500 delay-400 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                            }`}
                    >
                        <Link href="/">
                            <Button
                                variant="solid"
                                size="lg"
                                icon={<HomeIcon />}
                                txt="Ana Sayfaya Dön"
                            />
                        </Link>

                        <Button
                            variant="ghost"
                            size="lg"
                            icon={<ArrowLeftIcon />}
                            txt="Geri Dön"
                            onClick={() => window.history.back()}
                        />
                    </div>

                    {/* Popular Links */}
                    <div
                        className={`mt-12 pt-8 border-t border-border transition-all duration-500 delay-500 ${mounted ? "opacity-100" : "opacity-0"
                            }`}
                    >
                        <Text size="sm" color="muted" className="mb-4">
                            Popüler sayfalar:
                        </Text>
                        <div className="flex flex-wrap gap-3 justify-center">
                            {[
                                { label: "Ürünler", href: "/products" },
                                { label: "Kategoriler", href: "/categories" },
                                { label: "Kampanyalar", href: "/campaigns" },
                                { label: "İletişim", href: "/contact" },
                            ].map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="px-4 py-2 rounded-lg bg-muted hover:bg-primary-50 hover:text-primary transition-colors duration-200"
                                >
                                    <Text size="sm" weight="medium" as="span">
                                        {link.label}
                                    </Text>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-auto w-full border-t border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
                    <SiteFooter />
                </div>
            </footer>

            <CustomerServiceFAB />
        </div>
    );
}
