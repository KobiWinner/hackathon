'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

// ==================== Types ====================

export type SortDirection = 'asc' | 'desc';

export type SortState<T> = {
    field: keyof T | null;
    direction: SortDirection;
};

export type PaginationState = {
    page: number;
    pageSize: number;
    total: number;
};

export type UseDataTableOptions<T> = {
    mode: 'client' | 'server';
    data?: T[];
    fetchUrl?: string;
    fetchOptions?: RequestInit;
    initialPageSize?: number;
    searchFields?: (keyof T)[];
};

export type UseDataTableReturn<T> = {
    // Data
    displayData: T[];
    isLoading: boolean;
    error: Error | null;

    // Search
    searchTerm: string;
    setSearchTerm: (term: string) => void;

    // Sort
    sortState: SortState<T>;
    toggleSort: (field: keyof T) => void;

    // Pagination
    pagination: PaginationState;
    goToPage: (page: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    setPageSize: (size: number) => void;

    // Selection
    selectedRows: T[];
    selectedIds: Set<string | number>;
    toggleRowSelection: (row: T, id: string | number) => void;
    toggleAllSelection: () => void;
    clearSelection: () => void;
    isAllSelected: boolean;

    // Refresh (server mode)
    refresh: () => void;
};

// ==================== Hook ====================

/**
 * DataTable için state yönetimi hook'u.
 * Client ve Server modlarını destekler.
 */
export function useDataTable<T extends Record<string, unknown>>(
    options: UseDataTableOptions<T>
): UseDataTableReturn<T> {
    const {
        mode,
        data: clientData = [],
        fetchUrl,
        fetchOptions,
        initialPageSize = 10,
        searchFields,
    } = options;

    // Core state
    const [isLoading, setIsLoading] = useState(mode === 'server');
    const [error, setError] = useState<Error | null>(null);
    const [serverData, setServerData] = useState<T[]>([]);
    const [serverTotal, setServerTotal] = useState(0);

    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Sort state
    const [sortState, setSortState] = useState<SortState<T>>({
        field: null,
        direction: 'asc',
    });

    // Pagination state
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);

    // Selection state
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

    // Debounce search for server mode
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1); // Reset to first page on search
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // ==================== Server Mode Fetch ====================
    const fetchData = useCallback(async () => {
        if (mode !== 'server' || !fetchUrl) {return;}

        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('pageSize', String(pageSize));

            if (debouncedSearch) {
                params.set('search', debouncedSearch);
            }

            if (sortState.field) {
                params.set('sortField', String(sortState.field));
                params.set('sortDirection', sortState.direction);
            }

            const url = `${fetchUrl}?${params.toString()}`;
            const response = await fetch(url, {
                ...fetchOptions,
                headers: {
                    'Content-Type': 'application/json',
                    ...fetchOptions?.headers,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            // Support multiple response formats
            const items = result.data || result.items || result.results || [];
            const total = result.total || result.count || result.totalCount || items.length;

            setServerData(items);
            setServerTotal(total);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setIsLoading(false);
        }
    }, [mode, fetchUrl, fetchOptions, page, pageSize, debouncedSearch, sortState]);

    useEffect(() => {
        if (mode === 'server') {
            fetchData();
        }
    }, [mode, fetchData]);

    // ==================== Client Mode Processing ====================
    const processedClientData = useMemo(() => {
        if (mode !== 'client') {return [];}

        let result = [...clientData];

        // Search
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter((item) => {
                const fieldsToSearch = searchFields || (Object.keys(item) as (keyof T)[]);
                return fieldsToSearch.some((field) => {
                    const value = item[field];
                    if (value === null || value === undefined) {return false;}
                    return String(value).toLowerCase().includes(term);
                });
            });
        }

        // Sort
        if (sortState.field) {
            result.sort((a, b) => {
                const aVal = a[sortState.field!];
                const bVal = b[sortState.field!];

                if (aVal === bVal) {return 0;}
                if (aVal === null || aVal === undefined) {return 1;}
                if (bVal === null || bVal === undefined) {return -1;}

                let comparison = 0;
                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    comparison = aVal.localeCompare(bVal, 'tr');
                } else if (typeof aVal === 'number' && typeof bVal === 'number') {
                    comparison = aVal - bVal;
                } else {
                    comparison = String(aVal).localeCompare(String(bVal), 'tr');
                }

                return sortState.direction === 'asc' ? comparison : -comparison;
            });
        }

        return result;
    }, [mode, clientData, searchTerm, searchFields, sortState]);

    // Pagination
    const totalItems = mode === 'client' ? processedClientData.length : serverTotal;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    const displayData = useMemo(() => {
        if (mode === 'server') {
            return serverData;
        }

        const start = (page - 1) * pageSize;
        return processedClientData.slice(start, start + pageSize);
    }, [mode, serverData, processedClientData, page, pageSize]);

    // ==================== Actions ====================
    const toggleSort = useCallback((field: keyof T) => {
        setSortState((prev) => {
            if (prev.field === field) {
                return {
                    field,
                    direction: prev.direction === 'asc' ? 'desc' : 'asc',
                };
            }
            return { field, direction: 'asc' };
        });
        setPage(1);
    }, []);

    const goToPage = useCallback((newPage: number) => {
        setPage(Math.max(1, Math.min(newPage, totalPages)));
    }, [totalPages]);

    const nextPage = useCallback(() => {
        goToPage(page + 1);
    }, [page, goToPage]);

    const prevPage = useCallback(() => {
        goToPage(page - 1);
    }, [page, goToPage]);

    const changePageSize = useCallback((size: number) => {
        setPageSize(size);
        setPage(1);
    }, []);

    // Selection
    const toggleRowSelection = useCallback((row: T, id: string | number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const toggleAllSelection = useCallback(() => {
        if (selectedIds.size === displayData.length) {
            setSelectedIds(new Set());
        } else {
            const allIds = displayData.map((row) => {
                const id = (row as Record<string, unknown>).id;
                return id as string | number;
            }).filter(Boolean);
            setSelectedIds(new Set(allIds));
        }
    }, [displayData, selectedIds.size]);

    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    const selectedRows = useMemo(() => {
        return displayData.filter((row) => {
            const id = (row as Record<string, unknown>).id as string | number;
            return selectedIds.has(id);
        });
    }, [displayData, selectedIds]);

    const isAllSelected = displayData.length > 0 && selectedIds.size === displayData.length;

    return {
        displayData,
        isLoading,
        error,
        searchTerm,
        setSearchTerm,
        sortState,
        toggleSort,
        pagination: {
            page,
            pageSize,
            total: totalItems,
        },
        goToPage,
        nextPage,
        prevPage,
        setPageSize: changePageSize,
        selectedRows,
        selectedIds,
        toggleRowSelection,
        toggleAllSelection,
        clearSelection,
        isAllSelected,
        refresh: fetchData,
    };
}
