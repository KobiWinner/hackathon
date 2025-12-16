'use client';

import { useMediaQuery } from "@/shared/hooks/useMediaQuery";

/**
 * Dokunmatik cihaz tespiti yapar.
 * 
 * - `isTouchDevice`: pointer: coarse (parmak/stylus) varsa true
 * - `hasHoverCapability`: hover destekleyen cihazlarda true (fare/trackpad)
 * - `isDesktopWithMouse`: Hem lg+ ekran hem de hover desteği olan cihazlar
 * 
 * iPad Pro gibi 1024px+ dokunmatik cihazlar için kullanışlı.
 */
export function useTouchDevice(initialValue = false) {
    // pointer: coarse = parmak veya stylus (dokunmatik)
    // pointer: fine = fare veya trackpad
    const isTouchDevice = useMediaQuery("(pointer: coarse)", initialValue);

    // hover: hover = hover destekler (fare/trackpad)
    // hover: none = hover desteklemez (dokunmatik)
    const hasHoverCapability = useMediaQuery("(hover: hover)", !initialValue);

    // Büyük ekran VE fare/trackpad olan cihaz = gerçek desktop
    const isLargeScreen = useMediaQuery("(min-width: 1024px)", initialValue);
    const isDesktopWithMouse = isLargeScreen && hasHoverCapability && !isTouchDevice;

    return {
        isTouchDevice,
        hasHoverCapability,
        isDesktopWithMouse,
    };
}
