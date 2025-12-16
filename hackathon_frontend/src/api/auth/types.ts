// Backend OpenAPI spec'ine göre auth tipleri

// ==================== REQUEST TİPLERİ ====================

/**
 * Kullanıcı kayıt isteği - UserCreate schema'sına uygun
 */
export type RegisterRequest = {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    is_active?: boolean;
    phone_number?: string | null;
    is_superuser?: boolean;
    is_email_verified?: boolean;
    is_phone_verified?: boolean;
    role_ids?: number[] | null;
};

/**
 * Kullanıcı giriş isteği - LoginRequest schema'sına uygun
 */
export type LoginRequest = {
    email: string;
    password: string;
};

// ==================== RESPONSE TİPLERİ ====================

/**
 * Kullanıcı response - User schema'sına uygun
 */
export type UserResponse = {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string; // readonly, backend tarafından hesaplanır
    is_active: boolean;
    phone_number?: string | null;
    is_superuser: boolean;
    is_email_verified: boolean;
    is_phone_verified: boolean;
    hashed_password?: string | null;
};

/**
 * Token response - Token schema'sına uygun
 */
export type TokenResponse = {
    access_token: string;
    token_type: string; // default: "bearer"
};

/**
 * Auth response - login sonrası dönen veri
 */
export type AuthResponse = {
    user?: UserResponse;
    token: TokenResponse;
};

// ==================== FORM DATA TİPLERİ ====================

/**
 * Register form data - UI'dan gelen veri
 */
export type RegisterFormData = {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
};

/**
 * Login form data - UI'dan gelen veri
 */
export type LoginFormData = {
    email: string;
    password: string;
};
