'use client';

import Link from "next/link";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex flex-col gap-4 pt-6 text-sm text-gray-600 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 text-sm font-bold text-white">
          K
        </div>
        <span className="font-medium text-gray-700">
          Hackathon © {currentYear}
        </span>
      </div>

      <div className="flex items-center gap-4 text-gray-500">
        <Link
          href="/"
          className="hover:text-violet-600 transition-colors"
        >
          Ana Sayfa
        </Link>
        <a
          className="text-violet-600 underline decoration-violet-400/50 underline-offset-4 transition-colors hover:text-violet-700"
          href="https://github.com/KobiWinner/hackathon"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
