'use client';

import { useState } from "react";

import Link from "next/link";


interface SiteHeaderProps {
  isScrolled?: boolean;
}

export function SiteHeader({ isScrolled = false }: SiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Test', href: '/ardovski' },
  ];

  return (
    <>
      {/* Outer wrapper - all corners square at scroll 0, all rounded when scrolled */}
      <div
        className={`transition-all duration-500 ease-out ${isScrolled
          ? "rounded-2xl border border-violet-500/15 bg-white/90 shadow-lg shadow-violet-500/10 backdrop-blur-lg"
          : "rounded-none border border-transparent bg-white shadow-none"
          }`}
      >
        {/* Inner container */}
        <header className="mx-auto max-w-7xl flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between px-4 lg:px-8">
          <div className="flex items-center justify-between w-full">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 text-lg font-black text-white shadow-lg shadow-violet-500/30">
                K
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Hackathon
                </h1>
              </div>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden ml-auto rounded-lg p-2 text-gray-600 hover:bg-gray-100"
              aria-label="Menüyü aç"
            >
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex shrink-0 items-center gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 rounded-lg text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden flex flex-col gap-2 pt-4 border-t border-gray-200">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 rounded-lg text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          )}
        </header>
      </div>
    </>
  );
}
