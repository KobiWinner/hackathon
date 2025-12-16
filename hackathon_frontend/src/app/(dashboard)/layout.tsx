'use client';

import type { ReactNode } from "react";



import { useBoolean } from "@/hooks/useBoolean";
import { useTouchDevice } from "@/hooks/useTouchDevice";
import { DashboardFooter, DashboardHeader, DashboardSidebar, MobileSidebar } from "@/layout/dashboard";

export default function DashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    const { value: isCollapsed, setTrue: collapse, setFalse: expand } = useBoolean(false);
    const { value: isMobileOpen, setTrue: openMobile, setFalse: closeMobile } = useBoolean(false);

    // Dokunmatik cihaz algılama - iPad Pro dahil tüm touch cihazlar için drawer kullan
    const { isDesktopWithMouse } = useTouchDevice(true);

    return (
        <div className="flex min-h-screen bg-background">
            {/* Desktop Sidebar - Only for devices with mouse/trackpad AND lg+ screen */}
            {isDesktopWithMouse && (
                <aside
                    className={`sticky top-0 h-screen shrink-0 transition-[width] duration-300 ease-out ${isCollapsed ? "w-20" : "w-[280px]"
                        }`}
                    onMouseEnter={expand}
                    onMouseLeave={collapse}
                    aria-label="Ana navigasyon"
                >
                    <DashboardSidebar isCollapsed={isCollapsed} />
                </aside>
            )}

            {/* Mobile/Tablet Sidebar Drawer - For touch devices OR small screens */}
            {!isDesktopWithMouse && (
                <MobileSidebar isOpen={isMobileOpen} onClose={closeMobile} />
            )}

            {/* Main Content Area */}
            <div className="flex min-h-screen flex-1 flex-col">
                {/* Header - Shows hamburger on touch devices or small screens */}
                <DashboardHeader onMenuClick={openMobile} showMenuButton={!isDesktopWithMouse} />

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-3 xs:p-4 md:p-6" role="main">
                    <div className="mx-auto max-w-[1600px]">{children}</div>
                </main>

                {/* Footer */}
                <DashboardFooter />
            </div>
        </div>
    );
}
