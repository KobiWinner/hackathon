'use client';

import { useCallback, useMemo, useState } from 'react';

type UseSearchOptions<T> = {
    /** Aranacak alanlar */
    searchFields?: (keyof T)[];
    /** Case-insensitive arama */
    caseSensitive?: boolean;
};

/**
 * Client-side arama ve filtreleme hook'u.
 */
export function useSearch<T extends Record<string, unknown>>(
    items: T[],
    options: UseSearchOptions<T> = {}
) {
    const { searchFields, caseSensitive = false } = options;
    const [searchTerm, setSearchTerm] = useState('');

    const filteredItems = useMemo(() => {
        if (!searchTerm.trim()) {
            return items;
        }

        const term = caseSensitive ? searchTerm : searchTerm.toLowerCase();

        return items.filter((item) => {
            // Belirli alanları ara
            if (searchFields && searchFields.length > 0) {
                return searchFields.some((field) => {
                    const value = item[field];
                    if (value === null || value === undefined) {
                        return false;
                    }
                    const stringValue = String(value);
                    return caseSensitive
                        ? stringValue.includes(term)
                        : stringValue.toLowerCase().includes(term);
                });
            }

            // Tüm string alanları ara
            return Object.values(item).some((value) => {
                if (value === null || value === undefined) {
                    return false;
                }
                const stringValue = String(value);
                return caseSensitive
                    ? stringValue.includes(term)
                    : stringValue.toLowerCase().includes(term);
            });
        });
    }, [items, searchTerm, searchFields, caseSensitive]);

    const clearSearch = useCallback(() => {
        setSearchTerm('');
    }, []);

    return {
        searchTerm,
        setSearchTerm,
        filteredItems,
        clearSearch,
        isSearching: searchTerm.length > 0,
        resultCount: filteredItems.length,
    };
}

type SortDirection = 'asc' | 'desc';

type UseSortOptions<T> = {
    initialField?: keyof T;
    initialDirection?: SortDirection;
};

/**
 * Client-side sıralama hook'u.
 */
export function useSort<T extends Record<string, unknown>>(
    items: T[],
    options: UseSortOptions<T> = {}
) {
    const { initialField, initialDirection = 'asc' } = options;
    const [sortField, setSortField] = useState<keyof T | null>(initialField ?? null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(initialDirection);

    const sortedItems = useMemo(() => {
        if (!sortField) {
            return items;
        }

        return [...items].sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            // Null/undefined kontrolü
            if ((aValue === null || aValue === undefined) && (bValue === null || bValue === undefined)) {
                return 0;
            }
            if (aValue === null || aValue === undefined) {
                return sortDirection === 'asc' ? 1 : -1;
            }
            if (bValue === null || bValue === undefined) {
                return sortDirection === 'asc' ? -1 : 1;
            }

            // String karşılaştırma
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                const comparison = aValue.localeCompare(bValue, 'tr');
                return sortDirection === 'asc' ? comparison : -comparison;
            }

            // Sayı karşılaştırma
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }

            // Date karşılaştırma
            if (aValue instanceof Date && bValue instanceof Date) {
                return sortDirection === 'asc'
                    ? aValue.getTime() - bValue.getTime()
                    : bValue.getTime() - aValue.getTime();
            }

            return 0;
        });
    }, [items, sortField, sortDirection]);

    const toggleSort = useCallback((field: keyof T) => {
        setSortField((prevField) => {
            if (prevField === field) {
                setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                return field;
            }
            setSortDirection('asc');
            return field;
        });
    }, []);

    const resetSort = useCallback(() => {
        setSortField(null);
        setSortDirection('asc');
    }, []);

    return {
        sortField,
        sortDirection,
        sortedItems,
        toggleSort,
        resetSort,
        setSortField,
        setSortDirection,
        isSorted: sortField !== null,
    };
}

type FilterValue = string | number | boolean | null;
type Filters<T> = Partial<Record<keyof T, FilterValue | FilterValue[]>>;

/**
 * Client-side filtreleme hook'u.
 */
export function useFilter<T extends Record<string, unknown>>(items: T[]) {
    const [filters, setFilters] = useState<Filters<T>>({});

    const filteredItems = useMemo(() => {
        const activeFilters = Object.entries(filters).filter(
            ([, value]) => value !== null && value !== undefined && value !== ''
        );

        if (activeFilters.length === 0) {
            return items;
        }

        return items.filter((item) => {
            return activeFilters.every(([key, filterValue]) => {
                const itemValue = item[key as keyof T];

                // Array filter (OR mantığı)
                if (Array.isArray(filterValue)) {
                    return filterValue.includes(itemValue as FilterValue);
                }

                // Tek değer karşılaştırma
                return itemValue === filterValue;
            });
        });
    }, [items, filters]);

    const setFilter = useCallback(<K extends keyof T>(key: K, value: FilterValue | FilterValue[]) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    const removeFilter = useCallback(<K extends keyof T>(key: K) => {
        setFilters((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({});
    }, []);

    const activeFilterCount = Object.keys(filters).filter(
        (key) => filters[key as keyof T] !== null && filters[key as keyof T] !== undefined
    ).length;

    return {
        filters,
        filteredItems,
        setFilter,
        removeFilter,
        clearFilters,
        activeFilterCount,
        hasFilters: activeFilterCount > 0,
    };
}
