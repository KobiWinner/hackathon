/**
 * Güvenli Token Yönetim Servisi
 * 
 * Güvenlik Stratejisi:
 * 1. Token öncelikle bellekte (memory) saklanır - XSS korumalı
 * 2. İsteğe bağlı olarak sessionStorage kullanılabilir (tab kapanınca silinir)
 * 3. localStorage KULLANILMAZ (XSS saldırılarına karşı savunmasız)
 * 
 * NOT: En güvenli yöntem backend'in HTTP-only cookie kullanmasıdır.
 * Bu durumda token JS'ten erişilemez ve CSRF koruması ile tamamlanmalıdır.
 */

// Token bellekte saklanır - sayfa yenilenmesinde kaybolur ama en güvenli
let memoryToken: string | null = null;

// Güvenlik ayarları
const TOKEN_CONFIG = {
    // sessionStorage kullanılsın mı? (tab kapanana kadar kalır)
    // false = sadece memory (en güvenli, sayfa yenilenmesinde kaybolur)
    // true = session storage (tab kapanana kadar kalır, XSS riski var ama localStorage'dan güvenli)
    useSessionStorage: false,

    // Storage key (eğer sessionStorage aktifse)
    storageKey: "__auth_session",
} as const;

/**
 * Token'ı güvenli şekilde kaydeder
 */
export const saveToken = (token: string): void => {
    // Bellekte sakla (her zaman)
    memoryToken = token;

    // Opsiyonel: sessionStorage'a da kaydet
    if (TOKEN_CONFIG.useSessionStorage && typeof window !== "undefined") {
        try {
            sessionStorage.setItem(TOKEN_CONFIG.storageKey, token);
        } catch {
            // Private browsing modunda sessionStorage erişilemeyebilir
            console.warn("Token could not be saved to sessionStorage");
        }
    }
};

/**
 * Token'ı güvenli şekilde alır
 */
export const getToken = (): string | null => {
    // Önce bellekten kontrol et
    if (memoryToken) {
        return memoryToken;
    }

    // Bellekte yoksa ve sessionStorage aktifse oradan dene
    if (TOKEN_CONFIG.useSessionStorage && typeof window !== "undefined") {
        try {
            const storedToken = sessionStorage.getItem(TOKEN_CONFIG.storageKey);
            if (storedToken) {
                // Belleğe de yükle
                memoryToken = storedToken;
                return storedToken;
            }
        } catch {
            // Private browsing modunda sessionStorage erişilemeyebilir
        }
    }

    return null;
};

/**
 * Token'ı güvenli şekilde siler
 */
export const removeToken = (): void => {
    // Bellekten sil
    memoryToken = null;

    // sessionStorage'dan da sil
    if (typeof window !== "undefined") {
        try {
            sessionStorage.removeItem(TOKEN_CONFIG.storageKey);
        } catch {
            // Hata durumunda sessizce devam et
        }
    }
};

/**
 * Kullanıcının giriş yapıp yapmadığını kontrol eder
 */
export const isAuthenticated = (): boolean => {
    return getToken() !== null;
};

/**
 * Token'ın süresinin dolup dolmadığını kontrol eder
 * JWT decode edilerek exp claim'i kontrol edilir
 */
export const isTokenExpired = (): boolean => {
    const token = getToken();

    if (!token) {
        return true;
    }

    try {
        // JWT'nin payload kısmını decode et (base64)
        const payloadBase64 = token.split(".")[1];
        if (!payloadBase64) {
            return true;
        }

        const payload = JSON.parse(atob(payloadBase64));
        const exp = payload.exp;

        if (!exp) {
            // exp yoksa expired kabul et
            return true;
        }

        // exp Unix timestamp (saniye), Date.now() milisaniye
        const now = Math.floor(Date.now() / 1000);

        // 30 saniye buffer ekle (network gecikmesi için)
        return exp < now + 30;
    } catch {
        // Decode başarısızsa expired kabul et
        return true;
    }
};

/**
 * Token'dan kullanıcı bilgilerini çıkarır (decode)
 */
export const getTokenPayload = <T = Record<string, unknown>>(): T | null => {
    const token = getToken();

    if (!token) {
        return null;
    }

    try {
        const payloadBase64 = token.split(".")[1];
        if (!payloadBase64) {
            return null;
        }

        return JSON.parse(atob(payloadBase64)) as T;
    } catch {
        return null;
    }
};
