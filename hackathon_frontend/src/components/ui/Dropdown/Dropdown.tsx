'use client';

import { type ReactNode, createContext, useContext } from 'react';

import Link from 'next/link';

import { Text } from '@/components/ui/typography/Text';
import { useDropdown } from '@/hooks/useDropdown';
import { cn } from '@/lib/cn';

import type {
    DropdownAlign,
    DropdownContentProps,
    DropdownContextValue,
    DropdownFooterProps,
    DropdownGroupProps,
    DropdownHeaderProps,
    DropdownItemProps,
    DropdownProps,
    DropdownSeparatorProps,
    DropdownSide,
    DropdownTriggerProps,
} from './types';

// ============================================================================
// Context
// ============================================================================

const DropdownContext = createContext<DropdownContextValue | null>(null);

// eslint-disable-next-line no-restricted-syntax
function useDropdownContext() {
    const context = useContext(DropdownContext);
    if (!context) {
        throw new Error('Dropdown components must be used within a Dropdown');
    }
    return context;
}

// ============================================================================
// Root Component
// ============================================================================

function DropdownRoot({ children, defaultOpen = false, onOpenChange }: DropdownProps) {
    const dropdown = useDropdown({
        defaultOpen,
        onOpenChange,
        closeOnEscape: true,
        closeOnClickOutside: true,
    });

    const contextValue: DropdownContextValue = {
        isOpen: dropdown.isOpen,
        open: dropdown.open,
        close: dropdown.close,
        toggle: dropdown.toggle,
        triggerId: `dropdown-trigger-${dropdown.dropdownId}`,
        contentId: `dropdown-content-${dropdown.dropdownId}`,
        triggerRef: dropdown.triggerRef,
        contentRef: dropdown.contentRef,
    };

    return (
        <DropdownContext.Provider value={contextValue}>
            <div className="relative inline-block">
                {children}
            </div>
        </DropdownContext.Provider>
    );
}

// ============================================================================
// Trigger Component
// ============================================================================

function DropdownTrigger({ children, className }: Omit<DropdownTriggerProps, 'asChild'>) {
    const { toggle, isOpen, triggerId, contentId, triggerRef } = useDropdownContext();

    return (
        <button
            ref={triggerRef}
            type="button"
            onClick={toggle}
            aria-expanded={isOpen}
            aria-haspopup="menu"
            aria-controls={contentId}
            id={triggerId}
            className={cn(
                'inline-flex items-center justify-center transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                className
            )}
        >
            {children}
        </button>
    );
}


// ============================================================================
// Content Component
// ============================================================================

function getAlignmentClasses(align: DropdownAlign, side: DropdownSide): string {
    const sideClass = side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';

    const alignClasses: Record<DropdownAlign, string> = {
        start: 'left-0',
        center: 'left-1/2 -translate-x-1/2',
        end: 'right-0',
    };

    return `${sideClass} ${alignClasses[align]}`;
}

function DropdownContent({
    children,
    className,
    align = 'start',
    side = 'bottom',
}: DropdownContentProps) {
    const { isOpen, contentId, triggerId, contentRef } = useDropdownContext();

    if (!isOpen) { return null; }

    return (
        <div
            ref={contentRef}
            id={contentId}
            role="menu"
            aria-labelledby={triggerId}
            tabIndex={-1}
            className={cn(
                'absolute z-dropdown min-w-[12rem]',
                'bg-white rounded-2xl shadow-xl shadow-gray-200/50',
                'border border-border overflow-hidden',
                'animate-scale-in',
                getAlignmentClasses(align, side),
                className
            )}
        >
            {children}
        </div>
    );
}

// ============================================================================
// Item Component
// ============================================================================

function DropdownItem({
    children,
    className,
    href,
    onClick,
    icon: Icon,
    variant = 'default',
    disabled = false,
}: DropdownItemProps) {
    const { close } = useDropdownContext();

    const handleClick = () => {
        if (disabled) { return; }
        onClick?.();
        close();
    };

    const baseClasses = cn(
        'flex items-center gap-3 w-full px-4 py-3 text-left',
        'rounded-xl transition-colors',
        'focus-visible:outline-none focus-visible:bg-muted',
        disabled && 'opacity-50 cursor-not-allowed',
        variant === 'default' && 'hover:bg-muted',
        variant === 'danger' && 'hover:bg-danger-light text-danger',
        className
    );

    const content = (
        <>
            {Icon && (
                <Icon className={cn(
                    'h-5 w-5 shrink-0',
                    variant === 'default' ? 'text-muted-foreground' : 'text-danger'
                )} />
            )}
            <Text
                as="span"
                size="base"
                weight="medium"
                color={variant === 'danger' ? 'danger' : 'muted'}
                className="flex-1"
            >
                {children}
            </Text>
        </>
    );

    if (href && !disabled) {
        return (
            <Link href={href} className={baseClasses} onClick={handleClick} role="menuitem">
                {content}
            </Link>
        );
    }

    return (
        <button
            type="button"
            className={baseClasses}
            onClick={handleClick}
            disabled={disabled}
            role="menuitem"
        >
            {content}
        </button>
    );
}

// ============================================================================
// Group Component
// ============================================================================

function DropdownGroup({ children, label, className }: DropdownGroupProps) {
    return (
        <div className={cn('p-2', className)} role="group">
            {label && (
                <Text
                    as="div"
                    size="xs"
                    weight="semibold"
                    color="muted"
                    className="px-4 py-2 uppercase tracking-wider"
                >
                    {label}
                </Text>
            )}
            {children}
        </div>
    );
}

// ============================================================================
// Separator Component
// ============================================================================

function DropdownSeparator({ className }: DropdownSeparatorProps) {
    return (
        <div
            className={cn('h-px bg-border my-1', className)}
            role="separator"
            aria-orientation="horizontal"
        />
    );
}

// ============================================================================
// Header Component
// ============================================================================

function DropdownHeader({ children, className }: DropdownHeaderProps) {
    return (
        <div className={cn(
            'px-5 py-4 border-b border-border',
            'bg-gradient-to-r from-primary-50 to-white',
            className
        )}>
            {children}
        </div>
    );
}

// ============================================================================
// Footer Component
// ============================================================================

function DropdownFooter({ children, className }: DropdownFooterProps) {
    return (
        <div className={cn('p-2 border-t border-border', className)}>
            {children}
        </div>
    );
}

// ============================================================================
// Export as Compound Component
// ============================================================================

export const Dropdown = Object.assign(DropdownRoot, {
    Trigger: DropdownTrigger,
    Content: DropdownContent,
    Item: DropdownItem,
    Group: DropdownGroup,
    Separator: DropdownSeparator,
    Header: DropdownHeader,
    Footer: DropdownFooter,
});

// Named exports for direct imports
export {
    DropdownRoot,
    DropdownTrigger,
    DropdownContent,
    DropdownItem,
    DropdownGroup,
    DropdownSeparator,
    DropdownHeader,
    DropdownFooter,
};
