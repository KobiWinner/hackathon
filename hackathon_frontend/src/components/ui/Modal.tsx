'use client';

import type { ReactNode } from 'react';
import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/cn';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalProps {
    /** Modal'ın açık olup olmadığını kontrol eder */
    isOpen: boolean;
    /** Modal kapandığında çağrılır */
    onClose: () => void;
    /** Modal başlığı */
    title?: string;
    /** Modal içeriği */
    children: ReactNode;
    /** Modal boyutu */
    size?: ModalSize;
    /** Dışarı tıklandığında kapatılsın mı? */
    closeOnOverlayClick?: boolean;
    /** ESC tuşuyla kapatılsın mı? */
    closeOnEsc?: boolean;
    /** Footer bölümü (butonlar vb.) */
    footer?: ReactNode;
}

/**
 * Modal Bileşeni
 * -----------------
 * Ürün ekleme/düzenleme gibi işlemler için popup dialog.
 * - Animasyonlu açılış/kapanış
 * - ESC tuşu ve overlay tıklama desteği
 * - Farklı boyut seçenekleri
 */
export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    closeOnOverlayClick = true,
    closeOnEsc = true,
    footer,
}: ModalProps) {
    // ESC tuşu ile kapatma
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (closeOnEsc && e.key === 'Escape') {
                onClose();
            }
        },
        [closeOnEsc, onClose]
    );

    // ESC listener'ı ekle/kaldır
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            // Body scroll'u kilitle
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, handleKeyDown]);

    // Boyut sınıfları
    const sizeClasses: Record<ModalSize, string> = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[90vw] max-h-[90vh]',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Overlay (arka plan karartması) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeOnOverlayClick ? onClose : undefined}
                        aria-hidden="true"
                    />

                    {/* Modal içeriği */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className={cn(
                            'relative w-full rounded-2xl bg-white shadow-2xl',
                            'max-h-[85vh] overflow-hidden flex flex-col',
                            sizeClasses[size]
                        )}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={title ? 'modal-title' : undefined}
                    >
                        {/* Header */}
                        {title && (
                            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                                <h2
                                    id="modal-title"
                                    className="text-lg font-semibold text-foreground"
                                >
                                    {title}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                                    aria-label="Kapat"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* Body - Scroll edilebilir */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

                        {/* Footer */}
                        {footer && (
                            <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
