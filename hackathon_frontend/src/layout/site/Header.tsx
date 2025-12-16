'use client';

import { useState } from "react";

import Link from "next/link";

import { Menu, User, X } from "lucide-react";

import {
  CategoriesDropdown,
  SearchBar
} from "@/components/header";
import { Text } from "@/components/ui/typography/Text";
import { cn } from "@/lib/cn";

interface SiteHeaderProps {
  isScrolled?: boolean;
}

export function SiteHeader({ isScrolled = false }: SiteHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Outer wrapper */}
      <div
        className={cn(
          "transition-all duration-500 ease-out",
          isScrolled
            ? "rounded-2xl border border-primary/15 bg-white/90 shadow-lg shadow-primary/10 backdrop-blur-lg"
            : "rounded-none border border-transparent bg-white shadow-sm"
        )}
      >
        <header className="mx-auto max-w-7xl py-4 px-6 lg:px-8">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <Text as="h1" size="xl" weight="semibold" className="hidden lg:block">
                KobiWinner
              </Text>
            </Link>

            {/* Categories Dropdown */}
            <CategoriesDropdown />

            {/* Search Bar */}
            <SearchBar className="flex-1 max-w-2xl" />

            {/* Dashboard Link */}
            <Link
              href="/dashboard"
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all',
                'bg-muted hover:bg-primary-50 hover:text-primary',
                'font-medium'
              )}
            >
              <User className="h-5 w-5" />
              <span className="hidden lg:inline">Dashboard</span>
            </Link>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden">
            {/* Top Row: Logo + Hamburger */}
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <Text as="h1" size="lg" weight="semibold">
                  KobiWinner
                </Text>
              </Link>

              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="p-2.5 rounded-xl text-foreground hover:bg-muted transition-colors"
                >
                  <User className="h-5 w-5" />
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2.5 rounded-xl text-foreground hover:bg-muted transition-colors"
                  aria-label={isMobileMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mt-4">
              <SearchBar placeholder="Ara..." />
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <nav className="mt-4 pt-4 border-t border-border animate-slide-up">
                <CategoriesDropdown />
              </nav>
            )}
          </div>
        </header>
      </div>
    </>
  );
}
