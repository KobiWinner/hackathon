import { type RefObject, useEffect } from 'react';

type Handler = () => void;

/**
 * useClickOutside - Element dışına tıklandığında callback çağırır
 * 
 * @param ref - İzlenecek element referansı
 * @param handler - Dışarı tıklandığında çağrılacak fonksiyon
 * @param enabled - Hook'un aktif olup olmadığı (default: true)
 * 
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 * useClickOutside(ref, () => setIsOpen(false), isOpen);
 * ```
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
    ref: RefObject<T | null>,
    handler: Handler,
    enabled: boolean = true
): void {
    useEffect(() => {
        if (!enabled) {return;}

        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node;

            if (ref.current && !ref.current.contains(target)) {
                handler();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [ref, handler, enabled]);
}
