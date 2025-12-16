import type { ReactNode } from 'react';

// Dropdown pozisyonları
export type DropdownAlign = 'start' | 'center' | 'end';
export type DropdownSide = 'top' | 'bottom';

// Dropdown Context tipi
export type DropdownContextValue = {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
    triggerId: string;
    contentId: string;
    triggerRef: React.RefObject<HTMLButtonElement | null>;
    contentRef: React.RefObject<HTMLDivElement | null>;
};

// Root props
export type DropdownProps = {
    children: ReactNode;
    defaultOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
};

// Trigger props
export type DropdownTriggerProps = {
    children: ReactNode;
    className?: string;
    asChild?: boolean;
};

// Content props
export type DropdownContentProps = {
    children: ReactNode;
    className?: string;
    align?: DropdownAlign;
    side?: DropdownSide;
    sideOffset?: number;
};

// Item props
export type DropdownItemProps = {
    children: ReactNode;
    className?: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ComponentType<{ className?: string }>;
    variant?: 'default' | 'danger';
    disabled?: boolean;
};

// Group props
export type DropdownGroupProps = {
    children: ReactNode;
    label?: string;
    className?: string;
};

// Separator props
export type DropdownSeparatorProps = {
    className?: string;
};

// Header/Footer props
export type DropdownHeaderProps = {
    children: ReactNode;
    className?: string;
};

export type DropdownFooterProps = {
    children: ReactNode;
    className?: string;
};
