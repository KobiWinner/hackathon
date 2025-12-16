import { type ApiError, normalizeAxiosError } from "@/api/types";

import { httpClient } from "../httpClient";
import { getToken, getTokenPayload, isAuthenticated, isTokenExpired, removeToken, saveToken } from "./tokenService";

import type {
    AuthResponse,
    LoginFormData,
    LoginRequest,
    RegisterFormData,
    RegisterRequest,
    TokenResponse,
    UserResponse,
} from "./types";

// API endpoint'leri - OpenAPI spec'ine göre
const AUTH_ENDPOINTS = {
    REGISTER: "/api/v1/auth/register",
    LOGIN: "/api/v1/auth/login",
} as const;

// Token fonksiyonlarını re-export et
export { saveToken, removeToken, getToken, isAuthenticated, isTokenExpired, getTokenPayload };

// ==================== API CALLS ====================

/**
 * Kullanıcı kaydı yapar
 * POST /api/v1/auth/register
 */
export const registerUser = async (
    formData: RegisterFormData
): Promise<{ success: true; data: UserResponse } | { success: false; error: ApiError }> => {
    try {
        // Form verisini backend schema'sına dönüştür
        const requestData: RegisterRequest = {
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            password: formData.password,
            phone_number: formData.phone || null,
        };

        const response = await httpClient.post<UserResponse>(
            AUTH_ENDPOINTS.REGISTER,
            requestData
        );

        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            error: normalizeAxiosError(error),
        };
    }
};

/**
 * Kullanıcı girişi yapar
 * POST /api/v1/auth/login
 */
export const loginUser = async (
    formData: LoginFormData
): Promise<{ success: true; data: AuthResponse } | { success: false; error: ApiError }> => {
    try {
        const requestData: LoginRequest = {
            email: formData.email,
            password: formData.password,
        };

        const response = await httpClient.post<TokenResponse>(
            AUTH_ENDPOINTS.LOGIN,
            requestData
        );

        // Token'ı kaydet
        saveToken(response.data.access_token);

        return {
            success: true,
            data: {
                token: response.data,
            },
        };
    } catch (error) {
        return {
            success: false,
            error: normalizeAxiosError(error),
        };
    }
};

/**
 * Kullanıcı çıkışı yapar
 */
export const logoutUser = (): void => {
    removeToken();
};
