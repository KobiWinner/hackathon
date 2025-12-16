'use client';

import type { ReactNode } from 'react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/cn';
import { Input } from './Input';

/** Sütun tanımı - Tabloda hangi alanların gösterileceğini belirler */
export interface Column<T> {
    /** Benzersiz sütun ID'si */
    key: string;
    /** Sütun başlığı */
    header: string;
    /** Veri erişim fonksiyonu veya obje anahtarı */
    accessor: keyof T | ((row: T) => ReactNode);
    /** Sıralama yapılabilir mi? */
    sortable?: boolean;
    /** Sütun genişliği */
    width?: string;
    /** Hücre render fonksiyonu (özel görünüm için) */
    render?: (value: unknown, row: T) => ReactNode;
}

interface DataTableProps<T> {
    /** Gösterilecek veriler */
    data: T[];
    /** Sütun tanımları */
    columns: Column<T>[];
    /** Satır key'i için kullanılacak alan */
    keyField: keyof T;
    /** Arama yapılabilir mi? */
    searchable?: boolean;
    /** Arama placeholder metni */
    searchPlaceholder?: string;
    /** Boş durum mesajı */
    emptyMessage?: string;
    /** Yükleniyor durumu */
    loading?: boolean;
    /** Satır tıklama işlevi */
    onRowClick?: (row: T) => void;
    /** Ek CSS sınıfı */
    className?: string;
}

type SortDirection = 'asc' | 'desc' | null;

/**
 * DataTable Bileşeni
 * ---------------------
 * Ürün listesi için arama, sıralama ve animasyonlu tablo.
 * 
 * Özellikler:
 * - Sütunlara göre sıralama (A-Z, Z-A)
 * - Tablo içi arama
 * - Animasyonlu satır geçişleri
 * - Boş ve yükleniyor durumları
 * - Responsive tasarım
 */
export function DataTable<T extends object>({
    data,
    columns,
    keyField,
    searchable = true,
    searchPlaceholder = 'Ara...',
    emptyMessage = 'Gösterilecek veri bulunamadı.',
    loading = false,
    onRowClick,
    className,
}: DataTableProps<T>) {
    // State: Arama terimi
    const [searchTerm, setSearchTerm] = useState('');
    // State: Sıralama durumu
    const [sortConfig, setSortConfig] = useState<{
        key: string;
        direction: SortDirection;
    }>({ key: '', direction: null });

    // Sütuna tıklandığında sıralama yönünü değiştir
    const handleSort = (key: string) => {
        setSortConfig((prev) => {
            if (prev.key !== key) {
                return { key, direction: 'asc' };
            }
            if (prev.direction === 'asc') {
                return { key, direction: 'desc' };
            }
            return { key: '', direction: null };
        });
    };

    // Filtrelenmiş ve sıralanmış veri
    const processedData = useMemo(() => {
        let result = [...data];

        // Arama filtresi
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter((row) =>
                columns.some((col) => {
                    const value =
                        typeof col.accessor === 'function'
                            ? col.accessor(row)
                            : row[col.accessor];
                    return String(value).toLowerCase().includes(term);
                })
            );
        }

        // Sıralama
        if (sortConfig.key && sortConfig.direction) {
            const col = columns.find((c) => c.key === sortConfig.key);
            if (col) {
                result.sort((a, b) => {
                    const aValue =
                        typeof col.accessor === 'function'
                            ? col.accessor(a)
                            : a[col.accessor];
                    const bValue =
                        typeof col.accessor === 'function'
                            ? col.accessor(b)
                            : b[col.accessor];

                    const aStr = String(aValue ?? '');
                    const bStr = String(bValue ?? '');

                    if (sortConfig.direction === 'asc') {
                        return aStr.localeCompare(bStr, 'tr');
                    }
                    return bStr.localeCompare(aStr, 'tr');
                });
            }
        }

        return result;
    }, [data, columns, searchTerm, sortConfig]);

    // Sıralama ikonu
    const SortIcon = ({ columnKey }: { columnKey: string }) => {
        const isActive = sortConfig.key === columnKey;
        const direction = isActive ? sortConfig.direction : null;

        return (
            <span className="ml-1 inline-flex flex-col">
                <svg
                    className={cn('h-3 w-3', direction === 'asc' ? 'text-primary' : 'text-gray-300')}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M10 3l-7 7h14l-7-7z" />
                </svg>
                <svg
                    className={cn('h-3 w-3 -mt-1', direction === 'desc' ? 'text-primary' : 'text-gray-300')}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M10 17l7-7H3l7 7z" />
                </svg>
            </span>
        );
    };

    return (
        <div className={cn('space-y-4', className)}>
            {/* Arama kutusu */}
            {searchable && (
                <div className="max-w-sm">
                    <Input
                        type="search"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        leftAddon={
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        }
                    />
                </div>
            )}

            {/* Tablo container */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        {/* Tablo başlıkları */}
                        <thead className="bg-gray-50">
                            <tr>
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        scope="col"
                                        className={cn(
                                            'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600',
                                            col.sortable && 'cursor-pointer select-none hover:bg-gray-100'
                                        )}
                                        style={{ width: col.width }}
                                        onClick={col.sortable ? () => handleSort(col.key) : undefined}
                                    >
                                        <span className="flex items-center">
                                            {col.header}
                                            {col.sortable && <SortIcon columnKey={col.key} />}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        {/* Tablo gövdesi */}
                        <tbody className="divide-y divide-gray-100 bg-white">
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    // Yükleniyor skeleton
                                    [...Array(5)].map((_, i) => (
                                        <tr key={`skeleton-${i}`}>
                                            {columns.map((col) => (
                                                <td key={col.key} className="px-4 py-3">
                                                    <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : processedData.length === 0 ? (
                                    // Boş durum
                                    <tr>
                                        <td
                                            colSpan={columns.length}
                                            className="px-4 py-12 text-center text-gray-500"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <svg
                                                    className="h-12 w-12 text-gray-300"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1}
                                                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                                    />
                                                </svg>
                                                <span>{emptyMessage}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    // Veriler
                                    processedData.map((row) => (
                                        <motion.tr
                                            key={String(row[keyField])}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.2 }}
                                            className={cn(
                                                'transition-colors',
                                                onRowClick &&
                                                'cursor-pointer hover:bg-primary/5'
                                            )}
                                            onClick={onRowClick ? () => onRowClick(row) : undefined}
                                        >
                                            {columns.map((col) => {
                                                const value =
                                                    typeof col.accessor === 'function'
                                                        ? col.accessor(row)
                                                        : row[col.accessor];

                                                return (
                                                    <td
                                                        key={col.key}
                                                        className="whitespace-nowrap px-4 py-3 text-sm text-gray-700"
                                                    >
                                                        {col.render
                                                            ? col.render(value, row)
                                                            : (value as ReactNode)}
                                                    </td>
                                                );
                                            })}
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sonuç sayısı */}
            {!loading && (
                <p className="text-sm text-gray-500">
                    Toplam {processedData.length} kayıt{' '}
                    {searchTerm && `(${data.length} içinden filtrelendi)`}
                </p>
            )}
        </div>
    );
}
