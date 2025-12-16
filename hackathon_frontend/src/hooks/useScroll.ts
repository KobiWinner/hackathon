'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseScrollOptions {
    /** Scroll threshold in pixels */
    threshold?: number;
}

interface UseScrollReturn {
    /** Current scroll Y position */
    scrollY: number;
    /** Whether user has scrolled past threshold */
    isScrolled: boolean;
    /** Scroll direction: 'up' | 'down' | null */
    scrollDirection: 'up' | 'down' | null;
    /** Whether user is at the top of the page */
    isAtTop: boolean;
}

/**
 * Hook to track scroll position and direction
 * @param options - Configuration options
 * @returns Scroll state object
 */
export function useScroll(options: UseScrollOptions = {}): UseScrollReturn {
    const { threshold = 10 } = options;

    // Use refs to track values without triggering re-renders
    const lastScrollYRef = useRef(typeof window !== 'undefined' ? window.scrollY : 0);

    const [scrollState, setScrollState] = useState({
        scrollY: typeof window !== 'undefined' ? window.scrollY : 0,
        scrollDirection: null as 'up' | 'down' | null,
    });

    const handleScroll = useCallback(() => {
        const currentScrollY = window.scrollY;
        const lastScrollY = lastScrollYRef.current;

        // Determine scroll direction
        let direction: 'up' | 'down' | null = null;
        if (currentScrollY > lastScrollY) {
            direction = 'down';
        } else if (currentScrollY < lastScrollY) {
            direction = 'up';
        }

        // Update ref
        lastScrollYRef.current = currentScrollY;

        // Update state
        setScrollState({
            scrollY: currentScrollY,
            scrollDirection: direction,
        });
    }, []);

    useEffect(() => {
        // Throttled scroll handler using requestAnimationFrame
        let ticking = false;
        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [handleScroll]);

    return {
        scrollY: scrollState.scrollY,
        isScrolled: scrollState.scrollY > threshold,
        scrollDirection: scrollState.scrollDirection,
        isAtTop: scrollState.scrollY <= threshold,
    };
}
