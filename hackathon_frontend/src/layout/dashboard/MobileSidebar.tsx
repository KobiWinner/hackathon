'use client';

import { useEffect } from "react";

import { X } from "lucide-react";

import { cn } from "@/lib/cn";

import { DashboardSidebar } from "./Sidebar";

type MobileSidebarProps = {
    isOpen: boolean;
    onClose: () => void;
};

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
    // ESC tuşu ile kapatma
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") { onClose(); }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            // Scroll'u engelle
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    return (
        <>
            {/* Overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-modal bg-black/50 backdrop-blur-sm transition-opacity duration-300",
                    isOpen ? "opacity-100" : "pointer-events-none opacity-0"
                )}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-modal w-[280px] transform transition-transform duration-300 ease-out",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
                role="dialog"
                aria-modal="true"
                aria-label="Mobil navigasyon menüsü"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Menüyü kapat"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Sidebar Content */}
                <DashboardSidebar isCollapsed={false} onClose={onClose} />
            </aside>
        </>
    );
}
