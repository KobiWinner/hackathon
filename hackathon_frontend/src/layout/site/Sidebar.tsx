'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

// Navigation items - inline tanımlı
const siteNavigation = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Test', href: '/ardovski' },
];

type SiteSidebarProps = {
    onClose?: () => void;
    /** Sağdan açılıyor mu? Border yönünü değiştirir */
    fromRight?: boolean;
};

function NavItemComponent({ item, onClose }: { item: { name: string; href: string }; onClose?: () => void }) {
    const pathname = usePathname();
    const isActive = pathname === item.href;

    return (
        <li>
            <Link
                href={item.href}
                onClick={onClose}
                className={`group relative flex w-full items-center rounded-xl px-3 py-2.5 font-medium transition-all duration-200
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2
                    ${isActive
                        ? "bg-violet-500/10 text-violet-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                aria-current={isActive ? "page" : undefined}
            >
                {/* Active Indicator */}
                {isActive && (
                    <span
                        className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-violet-500 to-violet-600 shadow-md shadow-violet-500/40"
                        aria-hidden="true"
                    />
                )}

                {/* Label */}
                <span className="ml-3 flex-1 whitespace-nowrap text-left">
                    {item.name}
                </span>
            </Link>
        </li>
    );
}

export function SiteSidebar({ onClose, fromRight = false }: SiteSidebarProps) {
    return (
        <nav
            className={`relative flex h-full flex-col overflow-hidden bg-white px-4 pb-4 text-sm
                ${fromRight ? "border-l border-gray-200" : "border-r border-gray-200"}`}
            aria-label="Site navigasyon menüsü"
        >
            {/* Decorative gradient orb */}
            <div
                className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-violet-500/10 to-purple-500/10 blur-3xl"
                aria-hidden="true"
            />

            {/* Logo / Brand Area */}
            <div className="relative flex h-22 shrink-0 items-center gap-3 border-b border-gray-200 py-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg shadow-violet-500/30">
                    <span className="text-lg font-bold text-white">K</span>
                </div>
                <div className="min-w-0 overflow-hidden">
                    <h2 className="truncate text-lg font-bold text-gray-900">
                        Hackathon
                    </h2>
                    <p className="truncate text-xs text-gray-500">KobiWinner</p>
                </div>
            </div>

            {/* Navigation Container */}
            <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
                <div className="pr-4">
                    {/* Navigation Section Header */}
                    <div className="mb-3 h-5 overflow-hidden px-3">
                        <p className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Menü
                        </p>
                    </div>

                    {/* Navigation Items */}
                    <ul className="space-y-1.5">
                        {siteNavigation.map((item) => (
                            <NavItemComponent key={item.href} item={item} onClose={onClose} />
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    );
}
