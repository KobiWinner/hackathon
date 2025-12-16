import { httpClient } from "../httpClient";
import { type ApiError, normalizeAxiosError } from "@/api/types";

import type {
    AuthResponse,
    LoginFormData,
    RegisterFormData,
    RegisterRequest,
    UserResponse,
} from "./types";

// API endpoint'leri - backend'inize göre ayarlayın
const AUTH_ENDPOINTS = {
    // Item endpoint'i user olarak kullanılıyor
    REGISTER: "/items",
    LOGIN: "/items/search",
    GET_USER: (id: number) => `/items/${id}`,
} as const;

/**
 * Kullanıcı kaydı yapar
 * Backend'de Item olarak kaydedilir, gerçek user modeli hazır olduğunda güncellenecek
 */
export const registerUser = async (
    formData: RegisterFormData
): Promise<{ success: true; data: AuthResponse } | { success: false; error: ApiError }> => {
    try {
        // Form verisini backend schema'sına dönüştür
        const requestData: RegisterRequest = {
            title: formData.fullName,
            // Geçici çözüm: email ve password'u description'da saklıyoruz
            description: JSON.stringify({
                email: formData.email,
                phone: formData.phone || "",
                password: formData.password,
            }),
        };

        const response = await httpClient.post<UserResponse>(
            AUTH_ENDPOINTS.REGISTER,
            requestData
        );

        return {
            success: true,
            data: {
                user: response.data,
                // Backend JWT döndürdüğünde buraya eklenecek
                token: undefined,
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
 * Kullanıcı girişi yapar
 * Backend'de search endpoint'i kullanılıyor
 */
export const loginUser = async (
    formData: LoginFormData
): Promise<{ success: true; data: AuthResponse } | { success: false; error: ApiError }> => {
    try {
        // Search endpoint'ine POST isteği
        const searchParams = {
            // Backend'inizin QueryParams schema'sına göre ayarlayın
            filters: [
                {
                    field: "description",
                    operator: "contains",
                    value: formData.email,
                },
            ],
        };

        const response = await httpClient.post<UserResponse[]>(
            AUTH_ENDPOINTS.LOGIN,
            searchParams
        );

        const users = response.data;

        if (!users || users.length === 0) {
            return {
                success: false,
                error: {
                    status: 401,
                    message: "E-posta veya şifre hatalı.",
                    isNetworkError: false,
                },
            };
        }

        // Description'dan password'u kontrol et
        const user = users[0];
        try {
            const userData = JSON.parse(user.description);
            if (userData.password !== formData.password) {
                return {
                    success: false,
                    error: {
                        status: 401,
                        message: "E-posta veya şifre hatalı.",
                        isNetworkError: false,
                    },
                };
            }
        } catch {
            return {
                success: false,
                error: {
                    status: 500,
                    message: "Kullanıcı verisi okunamadı.",
                    isNetworkError: false,
                },
            };
        }

        return {
            success: true,
            data: {
                user,
                token: undefined,
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
 * Kullanıcı bilgilerini getirir
 */
export const getUserById = async (
    id: number
): Promise<{ success: true; data: UserResponse } | { success: false; error: ApiError }> => {
    try {
        const response = await httpClient.get<UserResponse>(
            AUTH_ENDPOINTS.GET_USER(id)
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
