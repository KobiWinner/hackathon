'use client';

import type { SelectHTMLAttributes } from 'react';
import { useId } from 'react';

import { cn } from '@/lib/cn';

interface SelectOption {
    /** Seçenek değeri (formda kullanılacak) */
    value: string | number;
    /** Görünen metin */
    label: string;
    /** Devre dışı mı? */
    disabled?: boolean;
}

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
    /** Label metni */
    label?: string;
    /** Yardımcı metin */
    description?: string;
    /** Hata mesajı */
    error?: string;
    /** Seçenek listesi */
    options: SelectOption[];
    /** Placeholder (boş seçenek) */
    placeholder?: string;
};

/**
 * Select Bileşeni
 * -----------------
 * Kategori, marka, cinsiyet gibi seçimler için dropdown.
 * - A11y desteği (aria-invalid, aria-describedby)
 * - Label ve hata mesajı entegrasyonu
 * - Özelleştirilebilir seçenekler
 */
export function Select({
    label,
    description,
    error,
    options,
    placeholder,
    className,
    id,
    required,
    ...props
}: SelectProps) {
    const generatedId = useId();
    const selectId = id ?? `${generatedId}-select`;
    const descriptionId = description ? `${selectId}-description` : undefined;
    const errorId = error ? `${selectId}-error` : undefined;
    const ariaDescribedBy = [descriptionId, errorId]
        .filter(Boolean)
        .join(' ')
        .trim() || undefined;

    const invalid = Boolean(error);

    return (
        <div className="flex flex-col gap-1">
            {/* Label */}
            {label && (
                <label
                    className="flex items-center gap-1 text-sm font-semibold text-foreground"
                    htmlFor={selectId}
                >
                    <span>{label}</span>
                    {required && (
                        <span aria-hidden className="text-danger">
                            *
                        </span>
                    )}
                </label>
            )}

            {/* Select Wrapper */}
            <div className="relative">
                <select
                    id={selectId}
                    className={cn(
                        'w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-10 text-sm',
                        'shadow-inner shadow-primary/5 outline-none transition-colors duration-150',
                        'focus:border-primary/70 focus:ring-2 focus:ring-primary/40',
                        invalid
                            ? 'border-danger/70 bg-danger/5 focus:ring-danger/60'
                            : 'border-border hover:border-primary/40',
                        className
                    )}
                    aria-invalid={invalid || undefined}
                    aria-describedby={ariaDescribedBy}
                    required={required}
                    {...props}
                >
                    {/* Placeholder seçenek */}
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}

                    {/* Seçenekler */}
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                {/* Dropdown oku ikonu */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>
            </div>

            {/* Description (helper text) */}
            {description && !error && (
                <p id={descriptionId} className="text-xs text-slate-500">
                    {description}
                </p>
            )}

            {/* Error mesajı */}
            {error && (
                <p id={errorId} className="text-xs font-medium text-danger">
                    {error}
                </p>
            )}
        </div>
    );
}
