'use client';

import Link from 'next/link';

import { motion } from 'framer-motion';

/**
 * Customer Service Floating Action Button
 * Sağ alt köşede her sayfada görünen müşteri hizmetleri butonu
 */
export function CustomerServiceFAB() {
    return (
        <Link href="/customerService">
            <motion.div
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-primary via-primary to-primary-600 shadow-xl shadow-primary/30"
                whileHover={{
                    scale: 1.1,
                    boxShadow: '0 20px 40px rgba(var(--primary-rgb, 99, 102, 241), 0.4)',
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                }}
            >
                {/* Chat Icon */}
                <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                </svg>

                {/* Pulse animation ring */}
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: 'easeOut',
                    }}
                />
            </motion.div>
        </Link>
    );
}
