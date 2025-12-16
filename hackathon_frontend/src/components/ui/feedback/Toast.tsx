'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

import { type Toast as ToastType, useToast } from '@/context/ToastContext';
import { cn } from '@/lib/cn';

const variantStyles = {
    success: 'border-success/40 bg-success-light text-success-dark',
    error: 'border-danger/40 bg-danger-light text-danger-dark',
    info: 'border-primary/40 bg-primary-50 text-primary-700',
    warning: 'border-warning/40 bg-warning-light text-warning-dark',
};

const variantIcons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
};

type ToastItemProps = {
    toast: ToastType;
    onClose: () => void;
};

function ToastItem({ toast, onClose }: ToastItemProps) {
    const Icon = variantIcons[toast.variant];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
                'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-elevated-md',
                variantStyles[toast.variant]
            )}
            role={toast.variant === 'error' ? 'alert' : 'status'}
            aria-live={toast.variant === 'error' ? 'assertive' : 'polite'}
        >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <div className="flex-1 space-y-1">
                <p className="text-fluid-sm font-semibold">{toast.title}</p>
                {toast.description ? (
                    <p className="text-fluid-xs opacity-90">{toast.description}</p>
                ) : null}
            </div>
            <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-lg p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current"
                aria-label="Bildirimi kapat"
            >
                <X className="h-4 w-4" />
            </button>
        </motion.div>
    );
}

/**
 * Toast bildirimlerini gösteren container.
 * Sayfanın sağ üst köşesinde konumlanır.
 */
export function ToastContainer() {
    const { toasts, removeToast } = useToast();

    return (
        <div
            aria-label="Bildirimler"
            className="pointer-events-none fixed right-0 top-0 z-tooltip flex flex-col gap-2 p-4"
        >
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}
