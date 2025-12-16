'use client';

import {
    type ReactNode,
    createContext,
    useCallback,
    useContext,
    useState,
} from 'react';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export type Toast = {
    id: string;
    title: string;
    description?: string;
    variant: ToastVariant;
    duration?: number;
};

type ToastContextType = {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

const DEFAULT_DURATION = 5000;

/**
 * Toast context hook. Must be used within ToastProvider.
 */
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

type ToastProviderProps = {
    children: ReactNode;
};

/**
 * Toast bildirimleri için context provider.
 * Uygulama genelinde toast göstermeyi sağlar.
 */
export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback(
        (toast: Omit<Toast, 'id'>) => {
            const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const duration = toast.duration ?? DEFAULT_DURATION;

            setToasts((prev) => [...prev, { ...toast, id }]);

            if (duration > 0) {
                setTimeout(() => removeToast(id), duration);
            }
        },
        [removeToast]
    );

    const success = useCallback(
        (title: string, description?: string) => {
            addToast({ title, description, variant: 'success' });
        },
        [addToast]
    );

    const error = useCallback(
        (title: string, description?: string) => {
            addToast({ title, description, variant: 'error' });
        },
        [addToast]
    );

    const info = useCallback(
        (title: string, description?: string) => {
            addToast({ title, description, variant: 'info' });
        },
        [addToast]
    );

    const warning = useCallback(
        (title: string, description?: string) => {
            addToast({ title, description, variant: 'warning' });
        },
        [addToast]
    );

    return (
        <ToastContext.Provider
            value={{ toasts, addToast, removeToast, success, error, info, warning }}
        >
            {children}
        </ToastContext.Provider>
    );
}
