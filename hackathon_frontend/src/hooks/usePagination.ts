'use client';

import { useCallback, useState } from 'react';

type UsePaginationOptions = {
    /** Başlangıç sayfası */
    initialPage?: number;
    /** Sayfa başına öğe sayısı */
    initialPageSize?: number;
    /** Toplam öğe sayısı */
    totalItems?: number;
};

/**
 * Sayfalama state yönetimi için hook.
 */
export function usePagination({
    initialPage = 1,
    initialPageSize = 10,
    totalItems = 0,
}: UsePaginationOptions = {}) {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [total, setTotal] = useState(totalItems);

    const totalPages = Math.ceil(total / pageSize) || 1;

    const goToPage = useCallback(
        (page: number) => {
            const safePage = Math.max(1, Math.min(page, totalPages));
            setCurrentPage(safePage);
        },
        [totalPages]
    );

    const nextPage = useCallback(() => {
        goToPage(currentPage + 1);
    }, [currentPage, goToPage]);

    const prevPage = useCallback(() => {
        goToPage(currentPage - 1);
    }, [currentPage, goToPage]);

    const firstPage = useCallback(() => {
        goToPage(1);
    }, [goToPage]);

    const lastPage = useCallback(() => {
        goToPage(totalPages);
    }, [goToPage, totalPages]);

    const changePageSize = useCallback((size: number) => {
        setPageSize(size);
        setCurrentPage(1); // Sayfa boyutu değişince ilk sayfaya dön
    }, []);

    // API için offset ve limit
    const offset = (currentPage - 1) * pageSize;
    const limit = pageSize;

    // Mevcut sayfadaki öğe aralığı
    const startIndex = offset + 1;
    const endIndex = Math.min(offset + pageSize, total);

    return {
        // State
        currentPage,
        pageSize,
        totalItems: total,
        totalPages,

        // Navigasyon
        goToPage,
        nextPage,
        prevPage,
        firstPage,
        lastPage,

        // Setters
        setCurrentPage,
        setPageSize: changePageSize,
        setTotalItems: setTotal,

        // API için
        offset,
        limit,

        // UI için
        startIndex,
        endIndex,

        // Kontroller
        canGoPrevious: currentPage > 1,
        canGoNext: currentPage < totalPages,
        isFirstPage: currentPage === 1,
        isLastPage: currentPage === totalPages,
    };
}
