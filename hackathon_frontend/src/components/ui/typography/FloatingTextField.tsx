'use client';

import type { InputHTMLAttributes, ReactNode } from 'react';
import { useCallback, useId, useState } from 'react';

import { AlertCircle } from 'lucide-react';

import { cn } from '@/lib/cn';

export type FloatingTextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'placeholder'> & {
    /** Floating label metin */
    label: string;
    /** Hata mesajı */
    error?: string;
    /** Sol taraf ikonu */
    leftIcon?: ReactNode;
    /** Sağ taraf ikonu/butonu */
    rightIcon?: ReactNode;
    /** Tam genişlik */
    fullWidth?: boolean;
};

/**
 * FloatingTextField - Material Design tarzı floating label input
 * 
 * - Hata varken rightIcon yerine error icon görünür
 * - Hover: popover görünür, mouse gitince kapanır
 * - Tıklama: popover sabitlenir (pinned), mouse gitse bile açık kalır
 */
export function FloatingTextField({
    label,
    error,
    leftIcon,
    rightIcon,
    fullWidth = true,
    className,
    id,
    required,
    disabled,
    value,
    defaultValue,
    onFocus,
    onBlur,
    type = 'text',
    ...props
}: FloatingTextFieldProps) {
    const generatedId = useId();
    const inputId = id ?? `floating-input-${generatedId}`;
    const errorId = error ? `${inputId}-error` : undefined;

    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isPinned, setIsPinned] = useState(false);

    const hasValue = value !== undefined ? Boolean(value) : Boolean(defaultValue);
    const isFloating = isFocused || hasValue;
    const hasError = Boolean(error);

    // Popover görünür: hover VEYA pinned
    const showPopover = isHovered || isPinned;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        onBlur?.(e);
    };

    // Mouse enter - hover state
    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
    }, []);

    // Mouse leave - sadece hover'ı kapat, pinned kalır
    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
    }, []);

    // Tıklama - toggle pinned
    const handleClick = useCallback(() => {
        setIsPinned(prev => !prev);
    }, []);

    // Input container sınıfları
    const containerClasses = cn(
        'relative flex items-center rounded-xl border-2 bg-white transition-all duration-200',
        isFocused && !hasError && 'border-primary',
        isFocused && hasError && 'border-danger',
        !isFocused && hasError && 'border-danger/60',
        !isFocused && !hasError && 'border-border hover:border-primary/40',
        disabled && 'cursor-not-allowed opacity-50 bg-muted'
    );

    // Input sınıfları
    const inputClasses = cn(
        'peer w-full bg-transparent py-4 text-fluid-sm text-foreground outline-none',
        'placeholder:text-transparent',
        'disabled:cursor-not-allowed',
        leftIcon ? 'pl-3' : 'px-4',
        'pr-12'
    );

    // Label sınıfları
    const labelClasses = cn(
        'pointer-events-none absolute transition-all duration-200 ease-out',
        leftIcon && !isFloating ? 'left-12' : '',
        !leftIcon && !isFloating ? 'left-4' : '',
        isFloating ? '-top-2.5 left-3 px-1.5 text-fluid-xs font-medium bg-white' : '',
        isFloating && isFocused && !hasError ? 'text-primary' : '',
        isFloating && isFocused && hasError ? 'text-danger' : '',
        isFloating && !isFocused && !hasError ? 'text-muted-foreground' : '',
        isFloating && !isFocused && hasError ? 'text-danger' : '',
        !isFloating ? 'top-1/2 -translate-y-1/2 text-fluid-sm text-muted-foreground' : ''
    );

    return (
        <div
            className={cn('relative', fullWidth && 'w-full', className)}
            role="group"
            aria-labelledby={`${inputId}-label`}
        >
            <div className={containerClasses}>
                {/* Sol ikon */}
                {leftIcon && (
                    <span
                        className="flex-shrink-0 pl-4 text-muted-foreground"
                        aria-hidden="true"
                    >
                        {leftIcon}
                    </span>
                )}

                {/* Input elementi */}
                <input
                    id={inputId}
                    type={type}
                    className={inputClasses}
                    placeholder={label}
                    aria-invalid={hasError}
                    aria-describedby={errorId}
                    aria-required={required}
                    required={required}
                    disabled={disabled}
                    value={value}
                    defaultValue={defaultValue}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...props}
                />

                {/* Floating label */}
                <label
                    id={`${inputId}-label`}
                    htmlFor={inputId}
                    className={labelClasses}
                >
                    {label}
                    {required && (
                        <span className="ml-0.5 text-danger" aria-hidden="true">
                            *
                        </span>
                    )}
                </label>

                {/* Sağ taraf: ERROR varsa error icon, yoksa rightIcon */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {hasError ? (
                        // Error icon container
                        <div
                            className="relative"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button
                                type="button"
                                onClick={handleClick}
                                className={cn(
                                    'text-danger transition-transform duration-150 active:scale-90 hover:scale-105 focus:outline-none rounded-full p-0.5',
                                    isPinned && 'scale-105'
                                )}
                                aria-label={isPinned ? 'Hata detayını gizle' : 'Hata detayını göster'}
                                aria-expanded={showPopover}
                                aria-describedby={errorId}
                            >
                                <AlertCircle className="h-5 w-5" />
                            </button>

                            {/* Popover - hover veya pinned durumunda görünür */}
                            {showPopover && (
                                <div
                                    id={errorId}
                                    role="alert"
                                    className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50"
                                >
                                    <div className="relative flex items-start gap-2 rounded-xl bg-danger p-3 text-white shadow-xl min-w-[180px] max-w-[260px]">
                                        {/* Sol ok işareti */}
                                        <div
                                            className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-danger"
                                            aria-hidden="true"
                                        />
                                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                        <p className="text-fluid-xs font-medium flex-1">{error}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : rightIcon ? (
                        // Normal right icon
                        <span aria-hidden="true">
                            {rightIcon}
                        </span>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
