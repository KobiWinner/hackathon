'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';

export type UseDropdownOptions = {
    /** Varsayılan açık/kapalı durumu */
    defaultOpen?: boolean;
    /** Escape tuşuyla kapatılsın mı */
    closeOnEscape?: boolean;
    /** Dışarı tıklayınca kapatılsın mı */
    closeOnClickOutside?: boolean;
    /** Item seçildiğinde kapatılsın mı */
    closeOnSelect?: boolean;
    /** Açılma/kapanma callback */
    onOpenChange?: (isOpen: boolean) => void;
};

export type UseDropdownReturn = {
    /** Dropdown açık mı */
    isOpen: boolean;
    /** Dropdown'u aç */
    open: () => void;
    /** Dropdown'u kapat */
    close: () => void;
    /** Toggle aç/kapat */
    toggle: () => void;
    /** Unique ID */
    dropdownId: string;
    /** Trigger ref */
    triggerRef: React.RefObject<HTMLButtonElement | null>;
    /** Content ref */
    contentRef: React.RefObject<HTMLDivElement | null>;
    /** Trigger için props */
    getTriggerProps: () => {
        ref: React.RefObject<HTMLButtonElement | null>;
        onClick: () => void;
        onKeyDown: (e: React.KeyboardEvent) => void;
        'aria-expanded': boolean;
        'aria-haspopup': 'menu';
        'aria-controls': string;
        id: string;
    };
    /** Content için props */
    getContentProps: () => {
        ref: React.RefObject<HTMLDivElement | null>;
        role: 'menu';
        'aria-labelledby': string;
        id: string;
        tabIndex: -1;
    };
};

/**
 * useDropdown - Dropdown state yönetimi hook'u
 * 
 * @example
 * ```tsx
 * const dropdown = useDropdown({ closeOnEscape: true });
 * 
 * return (
 *   <div>
 *     <button {...dropdown.getTriggerProps()}>Open</button>
 *     {dropdown.isOpen && (
 *       <div {...dropdown.getContentProps()}>Content</div>
 *     )}
 *   </div>
 * );
 * ```
 */
export function useDropdown(options: UseDropdownOptions = {}): UseDropdownReturn {
    const {
        defaultOpen = false,
        closeOnEscape = true,
        closeOnClickOutside = true,
        closeOnSelect: _closeOnSelect = true,
        onOpenChange,
    } = options;

    const [isOpen, setIsOpen] = useState(defaultOpen);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const id = useId();
    const triggerId = `dropdown-trigger-${id}`;
    const contentId = `dropdown-content-${id}`;

    // State değişikliği callback
    const handleOpenChange = useCallback((newState: boolean) => {
        setIsOpen(newState);
        onOpenChange?.(newState);
    }, [onOpenChange]);

    const open = useCallback(() => handleOpenChange(true), [handleOpenChange]);
    const close = useCallback(() => handleOpenChange(false), [handleOpenChange]);
    const toggle = useCallback(() => handleOpenChange(!isOpen), [handleOpenChange, isOpen]);

    // Escape tuşu ile kapatma
    useEffect(() => {
        if (!closeOnEscape || !isOpen) { return; }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                close();
                triggerRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [closeOnEscape, isOpen, close]);

    // Dışarı tıklayınca kapatma
    useEffect(() => {
        if (!closeOnClickOutside || !isOpen) { return; }

        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            const target = e.target as Node;

            const isOutsideTrigger = triggerRef.current && !triggerRef.current.contains(target);
            const isOutsideContent = contentRef.current && !contentRef.current.contains(target);

            if (isOutsideTrigger && isOutsideContent) {
                close();
            }
        };

        // Timeout ile event'i ekle (click event'inin bitmesini bekle)
        const timeoutId = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [closeOnClickOutside, isOpen, close]);

    // Trigger props getter
    const getTriggerProps = useCallback(() => ({
        ref: triggerRef,
        onClick: toggle,
        onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === 'ArrowDown' && !isOpen) {
                e.preventDefault();
                open();
            }
        },
        'aria-expanded': isOpen,
        'aria-haspopup': 'menu' as const,
        'aria-controls': contentId,
        id: triggerId,
    }), [toggle, isOpen, open, contentId, triggerId]);

    // Content props getter
    const getContentProps = useCallback(() => ({
        ref: contentRef,
        role: 'menu' as const,
        'aria-labelledby': triggerId,
        id: contentId,
        tabIndex: -1 as const,
    }), [triggerId, contentId]);

    return {
        isOpen,
        open,
        close,
        toggle,
        dropdownId: id,
        triggerRef,
        contentRef,
        getTriggerProps,
        getContentProps,
    };
}
