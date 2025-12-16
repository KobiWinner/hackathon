
import type { ElementType, HTMLAttributes, ReactNode } from 'react';

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

export type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

/** Text ağırlıkları */
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';

/** Text renkleri */
export type TextColor =
    | 'default'
    | 'muted'
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'success'
    | 'warning'
    | 'danger'
    | 'white';

/** Text hizalama */
export type TextAlign = 'left' | 'center' | 'right';

export type TextProps = Omit<HTMLAttributes<HTMLElement>, 'color'> & {
    /** İçerik */
    children: ReactNode;
    /** HTML element tipi */
    as?: ElementType;
    /** Boyut - fluid typography */
    size?: TextSize;
    /** Ağırlık */
    weight?: TextWeight;
    /** Renk */
    color?: TextColor;
    /** Hizalama */
    align?: TextAlign;
    /** Satır kesme */
    truncate?: boolean;
    /** Maksimum satır sayısı (line-clamp) */
    maxLines?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Altı çizili */
    underline?: boolean;
    /** Üstü çizili */
    lineThrough?: boolean;
    /** İtalik */
    italic?: boolean;
    /** Ek CSS sınıfı */
    className?: string;
};

const sizeClasses: Record<TextSize, string> = {
    xs: 'text-fluid-xs',
    sm: 'text-fluid-sm',
    base: 'text-fluid-base',
    lg: 'text-fluid-lg',
    xl: 'text-fluid-xl',
    '2xl': 'text-fluid-2xl',
    '3xl': 'text-fluid-3xl',
    '4xl': 'text-fluid-4xl',
};

const weightClasses: Record<TextWeight, string> = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
};

const colorClasses: Record<TextColor, string> = {
    default: 'text-foreground',
    muted: 'text-muted-foreground',
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    white: 'text-white',
};

const alignClasses: Record<TextAlign, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
};

const lineClampClasses: Record<number, string> = {
    1: 'line-clamp-1',
    2: 'line-clamp-2',
    3: 'line-clamp-3',
    4: 'line-clamp-4',
    5: 'line-clamp-5',
    6: 'line-clamp-6',
};

export function Text({
    children,
    as: Component = 'p',
    size = 'base',
    weight = 'normal',
    color = 'default',
    align,
    truncate = false,
    maxLines,
    underline = false,
    lineThrough = false,
    italic = false,
    className,
    ...props
}: TextProps) {
    return (
        <Component
            className={cn(
                sizeClasses[size],
                weightClasses[weight],
                colorClasses[color],
                align ? alignClasses[align] : '',
                truncate ? 'truncate' : '',
                maxLines ? lineClampClasses[maxLines] : '',
                underline ? 'underline underline-offset-2' : '',
                lineThrough ? 'line-through' : '',
                italic ? 'italic' : '',
                className
            )}
            {...props}
        >
            {children}
        </Component>
    );
}


// Convenience components
export function Heading({
    level = 1,
    children,
    ...props
}: Omit<TextProps, 'as'> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }) {
    const defaultSizes: Record<number, TextSize> = {
        1: '4xl',
        2: '3xl',
        3: '2xl',
        4: 'xl',
        5: 'lg',
        6: 'base',
    };

    return (
        <Text
            as={`h${level}` as ElementType}
            size={props.size ?? defaultSizes[level]}
            weight={props.weight ?? 'bold'}
            {...props}
        >
            {children}
        </Text>
    );
}

export function Label({
    children,
    htmlFor,
    required,
    ...props
}: Omit<TextProps, 'as'> & { htmlFor?: string; required?: boolean }) {
    return (
        <Text
            as="label"
            size={props.size ?? 'sm'}
            weight={props.weight ?? 'medium'}
            className={cn(props.className, htmlFor && 'cursor-pointer')}
            {...(htmlFor && { htmlFor })}
            {...props}
        >
            {children}
            {required && (
                <span className="ml-0.5 text-danger" aria-hidden="true">
                    *
                </span>
            )}
        </Text>
    );
}

export function Caption({
    children,
    ...props
}: Omit<TextProps, 'size'>) {
    return (
        <Text
            size="xs"
            color={props.color ?? 'muted'}
            {...props}
        >
            {children}
        </Text>
    );
}
