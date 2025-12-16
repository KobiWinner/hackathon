'use client';

import type {
    AnchorHTMLAttributes,
    ButtonHTMLAttributes,
    ReactNode,
} from "react";

import { motion } from "framer-motion";

import { Text, type TextColor } from "../typography/Text";

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

type ButtonVariant = "solid" | "ghost" | "gradient" | "outline" | "secondary" | "white";
type ButtonSize = "xs" | "sm" | "md" | "lg";

type ButtonProps = (
    | (ButtonHTMLAttributes<HTMLButtonElement> & { as?: "button" })
    | (AnchorHTMLAttributes<HTMLAnchorElement> & { as: "a" })
) & {
    variant?: ButtonVariant;
    icon?: ReactNode;
    size?: ButtonSize;
    loading?: boolean;
    /** Buton metni - Text componenti ile render edilir */
    txt?: string;
    /** Text rengi - Text component'ine aktarılır */
    txtColor?: TextColor;
    /** Tam genişlik */
    fullWidth?: boolean;
    /** Gölge efekti */
    shadow?: boolean;
    /** Blur backdrop efekti */
    backdrop?: boolean;
    children?: ReactNode;
};

export function Button({
    children,
    className,
    variant = "solid",
    icon,
    as = "button",
    size = "md",
    loading = false,
    txt,
    txtColor,
    fullWidth = false,
    shadow = true,
    backdrop = false,
    ...props
}: ButtonProps) {
    const sizeClasses = {
        xs: "px-2.5 py-1 gap-1",
        sm: "px-3 py-1.5 gap-1.5",
        md: "px-5 py-2.5 gap-2",
        lg: "px-6 py-3 gap-2",
    };

    // Text size mapping based on button size
    const textSizeMap = {
        xs: "xs" as const,
        sm: "sm" as const,
        md: "sm" as const,
        lg: "base" as const,
    };

    // Default text colors based on variant
    const defaultTextColors: Record<ButtonVariant, TextColor> = {
        solid: "white",
        gradient: "white",
        secondary: "white",
        white: "primary",
        outline: "primary",
        ghost: "default",
    };

    const baseClasses = cn(
        "relative inline-flex items-center justify-center rounded-xl transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        loading && "cursor-wait",
        fullWidth && "w-full",
        backdrop && "backdrop-blur-sm",
    );

    const variantClasses = {
        solid: cn(
            "bg-primary",
            shadow && "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30",
            "hover:bg-primary-600 active:scale-[0.98]"
        ),
        gradient: cn(
            "bg-gradient-to-r from-primary via-accent to-secondary",
            shadow && "shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-accent/40",
            "hover:scale-[1.02] active:scale-[0.98]"
        ),
        secondary: cn(
            "bg-secondary",
            shadow && "shadow-lg shadow-secondary/25 hover:shadow-xl hover:shadow-secondary/30",
            "hover:bg-secondary-600 active:scale-[0.98]"
        ),
        white: cn(
            "bg-white",
            shadow && "shadow-xl shadow-white/20",
            "hover:bg-white/90 active:scale-[0.98]"
        ),
        outline: cn(
            "border-2 border-primary bg-transparent",
            "hover:bg-primary hover:text-white active:scale-[0.98]"
        ),
        ghost: cn(
            "border border-border bg-background/50",
            "hover:bg-primary/5 hover:border-primary/40 active:scale-[0.98]"
        ),
    };

    // Resolve text color
    const resolvedTxtColor = txtColor || defaultTextColors[variant];

    const content = (
        <>
            {loading && (
                <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            )}
            {!loading && icon}
            {txt ? (
                <Text as="span" size={textSizeMap[size]} weight="semibold" color={resolvedTxtColor} className="leading-none">
                    {txt}
                </Text>
            ) : (
                children
            )}
        </>
    );

    const combinedClassName = cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        className,
    );

    const motionProps = {
        whileHover: { scale: variant === "ghost" || variant === "outline" ? 1.01 : 1.02 },
        whileTap: { scale: 0.98 },
        transition: { type: "spring" as const, stiffness: 400, damping: 17 },
    };

    if (as === "a") {
        const {
            onDrag: _onDrag,
            onDragStart: _onDragStart,
            onDragEnd: _onDragEnd,
            onAnimationStart: _onAnimationStart,
            onAnimationEnd: _onAnimationEnd,
            ...anchorProps
        } = props as AnchorHTMLAttributes<HTMLAnchorElement>;
        return (
            <motion.a
                className={combinedClassName}
                {...motionProps}
                {...anchorProps}
            >
                {content}
            </motion.a>
        );
    }

    const {
        type = "button",
        disabled,
        onDrag: _onDrag2,
        onDragStart: _onDragStart2,
        onDragEnd: _onDragEnd2,
        onAnimationStart: _onAnimationStart2,
        onAnimationEnd: _onAnimationEnd2,
        ...buttonProps
    } = props as ButtonHTMLAttributes<HTMLButtonElement>;

    return (
        <motion.button
            className={combinedClassName}
            type={type}
            disabled={disabled || loading}
            {...motionProps}
            {...buttonProps}
        >
            {content}
        </motion.button>
    );
}
