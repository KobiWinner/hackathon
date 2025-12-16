'use client';

import { useCallback, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Clock, Loader2, Search, X } from 'lucide-react';

import { searchService } from '@/api/search';
import type { SearchResult } from '@/api/search';
import { Text } from '@/components/ui/typography/Text';
import { useClickOutside } from '@/hooks/useClickOutside';
import { cn } from '@/lib/cn';

type SearchBarProps = {
    className?: string;
    placeholder?: string;
};

export function SearchBar({ className, placeholder = 'Ürün, kategori veya marka ara...' }: SearchBarProps) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [_results, setResults] = useState<SearchResult[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>(() => {
        if (typeof window === 'undefined') { return []; }
        return searchService.getRecentSearches();
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const showDropdown = isFocused && recentSearches.length > 0 && query.length === 0;

    useClickOutside(containerRef, () => setIsFocused(false), isFocused);

    // Arama yap - sadece Enter'a basınca
    const handleSearch = useCallback(async (searchQuery?: string) => {
        const q = (searchQuery || query).trim();
        if (!q) { return; }

        setIsLoading(true);
        try {
            const response = await searchService.search(q);
            setResults(response.results);
            searchService.addRecentSearch(q);
            setRecentSearches(searchService.getRecentSearches());
            setIsFocused(false);
            router.push(`/search?q=${encodeURIComponent(q)}`);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [query, router]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        } else if (e.key === 'Escape') {
            setIsFocused(false);
            inputRef.current?.blur();
        }
    };

    const clearRecentSearches = () => {
        searchService.clearRecentSearches();
        setRecentSearches([]);
    };

    const clearQuery = () => {
        setQuery('');
        setResults([]);
        inputRef.current?.focus();
    };

    return (
        <div ref={containerRef} className={cn('relative', className)}>
            {/* Search Input */}
            <div className={cn(
                'flex items-center gap-3 bg-muted rounded-xl transition-all duration-200',
                'border-2',
                isFocused ? 'border-primary bg-white shadow-lg shadow-primary/10' : 'border-transparent',
                'px-5 py-3'
            )}>
                <Search className={cn(
                    'h-5 w-5 shrink-0 transition-colors',
                    isFocused ? 'text-primary' : 'text-muted-foreground'
                )} />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className={cn(
                        'flex-1 bg-transparent outline-none text-base',
                        'placeholder:text-muted-foreground'
                    )}
                />
                {isLoading && (
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
                )}
                {query && !isLoading && (
                    <button
                        onClick={clearQuery}
                        className="p-1 hover:bg-white rounded-lg transition-colors"
                    >
                        <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                )}
            </div>

            {/* Dropdown - Recent Searches Only */}
            {showDropdown && (
                <div className={cn(
                    'absolute top-full left-0 right-0 mt-2 z-dropdown',
                    'bg-white rounded-2xl shadow-xl shadow-gray-200/50',
                    'border border-border overflow-hidden',
                    'animate-scale-in'
                )}>
                    {/* Recent Searches */}
                    <div className="p-4 border-b border-border">
                        <div className="flex items-center justify-between mb-3">
                            <Text size="sm" weight="semibold" color="muted">
                                Son Aramalar
                            </Text>
                            <button
                                onClick={clearRecentSearches}
                                className="hover:opacity-70 transition-opacity"
                            >
                                <Text size="xs" color="primary" weight="medium">
                                    Temizle
                                </Text>
                            </button>
                        </div>
                        <div className="space-y-1">
                            {recentSearches.map((search, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setQuery(search);
                                        handleSearch(search);
                                    }}
                                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-left"
                                >
                                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <Text size="base" className="truncate">
                                        {search}
                                    </Text>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
