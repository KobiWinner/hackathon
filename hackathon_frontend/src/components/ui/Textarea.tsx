'use client';

import type { TextareaHTMLAttributes } from 'react';
import { useId } from 'react';

import { cn } from '@/lib/cn';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
    /** Label metni */
    label?: string;
    /** Yardımcı metin */
    description?: string;
    /** Hata mesajı */
    error?: string;
};

/**
 * Textarea Bileşeni
 * -------------------
 * Ürün açıklaması gibi uzun metinler için çok satırlı input.
 * - A11y desteği
 * - Label ve hata mesajı entegrasyonu
 * - Input bileşeni ile tutarlı tasarım
 */
export function Textarea({
    label,
    description,
    error,
    className,
    id,
    required,
    rows = 4,
    ...props
}: TextareaProps) {
    const generatedId = useId();
    const textareaId = id ?? `${generatedId}-textarea`;
    const descriptionId = description ? `${textareaId}-description` : undefined;
    const errorId = error ? `${textareaId}-error` : undefined;
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
                    htmlFor={textareaId}
                >
                    <span>{label}</span>
                    {required && (
                        <span aria-hidden className="text-danger">
                            *
                        </span>
                    )}
                </label>
            )}

            {/* Textarea */}
            <textarea
                id={textareaId}
                rows={rows}
                className={cn(
                    'w-full rounded-lg border bg-white px-3 py-2 text-sm resize-none',
                    'shadow-inner shadow-primary/5 outline-none transition-colors duration-150',
                    'placeholder:text-slate-400',
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
            />

            {/* Description */}
            {description && !error && (
                <p id={descriptionId} className="text-xs text-slate-500">
                    {description}
                </p>
            )}

            {/* Error */}
            {error && (
                <p id={errorId} className="text-xs font-medium text-danger">
                    {error}
                </p>
            )}
        </div>
    );
}
