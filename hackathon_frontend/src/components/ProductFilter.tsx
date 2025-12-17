'use client';

import { useState, useMemo } from 'react';

import { Button } from '@/components/ui/buttons/Button';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/typography/Text';
import { cn } from '@/lib/cn';

// Filter Types
export interface FilterValues {
    categories: string[];
    brands: string[];
    minPrice: string;
    maxPrice: string;
    sortBy: string;
}

export interface FilterOption {
    value: string;
    label: string;
}

export interface ProductFilterProps {
    categories: FilterOption[];
    brands: FilterOption[];
    priceRange?: { min: number; max: number };
    onFilter: (filters: FilterValues) => void;
    className?: string;
}

const sortOptions: FilterOption[] = [
    { value: '', label: 'Varsayılan' },
    { value: 'price_asc', label: 'Fiyat: Düşükten Yükseğe' },
    { value: 'price_desc', label: 'Fiyat: Yüksekten Düşüğe' },
    { value: 'trend', label: 'Trend Skoru' },
    { value: 'name_asc', label: 'İsim: A-Z' },
    { value: 'name_desc', label: 'İsim: Z-A' },
];

// Checkbox Group Component
function CheckboxGroup({
    label,
    options,
    selectedValues,
    onChange,
}: {
    label: string;
    options: FilterOption[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
}) {
    const handleToggle = (value: string) => {
        if (selectedValues.includes(value)) {
            onChange(selectedValues.filter((v) => v !== value));
        } else {
            onChange([...selectedValues, value]);
        }
    };

    return (
        <div className="flex flex-col min-h-0">
            <Text size="sm" weight="bold" className="text-foreground shrink-0 pb-2">
                {label}
            </Text>
            <div className="space-y-1 overflow-y-auto max-h-32 pr-1">
                {options.map((option) => (
                    <label
                        key={option.value}
                        className={cn(
                            'flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors',
                            'hover:bg-primary/5',
                            selectedValues.includes(option.value) && 'bg-primary/10'
                        )}
                    >
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={selectedValues.includes(option.value)}
                                onChange={() => handleToggle(option.value)}
                                className="sr-only peer"
                            />
                            <div
                                className={cn(
                                    'w-5 h-5 rounded-md border-2 transition-all duration-200',
                                    'flex items-center justify-center',
                                    selectedValues.includes(option.value)
                                        ? 'bg-gradient-to-br from-primary to-accent border-primary'
                                        : 'border-border bg-white hover:border-primary/50'
                                )}
                            >
                                {selectedValues.includes(option.value) && (
                                    <svg
                                        className="w-3 h-3 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={3}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                        </div>
                        <Text size="sm" color={selectedValues.includes(option.value) ? 'primary' : 'default'}>
                            {option.label}
                        </Text>
                    </label>
                ))}
            </div>
        </div>
    );
}

// Radio Group for Sort
function RadioGroup({
    label,
    options,
    selectedValue,
    onChange,
}: {
    label: string;
    options: FilterOption[];
    selectedValue: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="flex flex-col min-h-0">
            <Text size="sm" weight="bold" className="text-foreground shrink-0 pb-2">
                {label}
            </Text>
            <div className="space-y-1 overflow-y-auto max-h-32 pr-1">
                {options.map((option) => (
                    <label
                        key={option.value}
                        className={cn(
                            'flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors',
                            'hover:bg-primary/5',
                            selectedValue === option.value && 'bg-primary/10'
                        )}
                    >
                        <div className="relative">
                            <input
                                type="radio"
                                name="sortBy"
                                checked={selectedValue === option.value}
                                onChange={() => onChange(option.value)}
                                className="sr-only"
                            />
                            <div
                                className={cn(
                                    'w-5 h-5 rounded-full border-2 transition-all duration-200',
                                    'flex items-center justify-center',
                                    selectedValue === option.value
                                        ? 'border-primary'
                                        : 'border-border bg-white hover:border-primary/50'
                                )}
                            >
                                {selectedValue === option.value && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-primary to-accent" />
                                )}
                            </div>
                        </div>
                        <Text size="sm" color={selectedValue === option.value ? 'primary' : 'default'}>
                            {option.label}
                        </Text>
                    </label>
                ))}
            </div>
        </div>
    );
}

export function ProductFilter({
    categories,
    brands,
    priceRange,
    onFilter,
    className,
}: ProductFilterProps) {
    // Filter state
    const [filters, setFilters] = useState<FilterValues>({
        categories: [],
        brands: [],
        minPrice: '',
        maxPrice: '',
        sortBy: '',
    });

    // Seçili filtre sayısını hesapla
    const activeFilterCount = useMemo(() => {
        let count = 0;
        count += filters.categories.length;
        count += filters.brands.length;
        if (filters.minPrice) count++;
        if (filters.maxPrice) count++;
        if (filters.sortBy) count++;
        return count;
    }, [filters]);

    // Filtre değerini güncelle
    const updateFilter = <K extends keyof FilterValues>(key: K, value: FilterValues[K]) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    // Filtrele butonuna basıldığında
    const handleApplyFilter = () => {
        onFilter(filters);
    };

    // Filtreleri temizle
    const handleClearFilters = () => {
        const emptyFilters: FilterValues = {
            categories: [],
            brands: [],
            minPrice: '',
            maxPrice: '',
            sortBy: '',
        };
        setFilters(emptyFilters);
        onFilter(emptyFilters);
    };

    return (
        <div
            className={cn(
                'bg-gradient-to-br from-card via-card to-primary/5 rounded-2xl border border-border shadow-lg',
                'sticky top-24 max-h-[calc(100vh-120px)] flex flex-col',
                className
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                            />
                        </svg>
                    </div>
                    <div>
                        <Text size="base" weight="bold">Filtrele</Text>
                        {activeFilterCount > 0 && (
                            <Text size="xs" color="muted">
                                {activeFilterCount} filtre aktif
                            </Text>
                        )}
                    </div>
                </div>

                {activeFilterCount > 0 && (
                    <button
                        onClick={handleClearFilters}
                        className="text-xs text-danger hover:text-danger/80 font-medium transition-colors flex items-center gap-1"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Temizle
                    </button>
                )}
            </div>

            {/* Filter Content */}
            <div className="p-4 space-y-6 overflow-y-auto flex-1 min-h-0 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                {/* Kategoriler */}
                <CheckboxGroup
                    label="Kategoriler"
                    options={categories}
                    selectedValues={filters.categories}
                    onChange={(vals) => updateFilter('categories', vals)}
                />

                <div className="h-px bg-border" />

                {/* Markalar */}
                <CheckboxGroup
                    label="Markalar"
                    options={brands}
                    selectedValues={filters.brands}
                    onChange={(vals) => updateFilter('brands', vals)}
                />

                <div className="h-px bg-border" />

                {/* Fiyat Aralığı */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Text size="sm" weight="bold" className="text-foreground">
                            Fiyat Aralığı
                        </Text>
                        {priceRange && priceRange.max > 0 && (
                            <Text size="xs" color="muted">
                                ₺{priceRange.min.toLocaleString('tr-TR')} - ₺{priceRange.max.toLocaleString('tr-TR')}
                            </Text>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Input
                            type="number"
                            placeholder={priceRange ? `Min ₺${priceRange.min.toLocaleString('tr-TR')}` : 'Min ₺'}
                            value={filters.minPrice}
                            onChange={(e) => updateFilter('minPrice', e.target.value)}
                        />
                        <Input
                            type="number"
                            placeholder={priceRange ? `Max ₺${priceRange.max.toLocaleString('tr-TR')}` : 'Max ₺'}
                            value={filters.maxPrice}
                            onChange={(e) => updateFilter('maxPrice', e.target.value)}
                        />
                    </div>
                </div>

                <div className="h-px bg-border" />

                {/* Sıralama */}
                <RadioGroup
                    label="Sıralama"
                    options={sortOptions}
                    selectedValue={filters.sortBy}
                    onChange={(val) => updateFilter('sortBy', val)}
                />
            </div>

            {/* Apply Button */}
            <div className="p-4 border-t border-border">
                <Button
                    variant="solid"
                    size="md"
                    fullWidth
                    onClick={handleApplyFilter}
                    shadow
                    icon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    }
                    txt="Filtrele"
                />
            </div>
        </div>
    );
}
