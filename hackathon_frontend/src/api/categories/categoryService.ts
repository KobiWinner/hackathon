/**
 * Category Service
 * Backend /api/v1/categories endpoint'lerine bağlanır
 */

import { httpClient } from "../httpClient";
import { type ApiError, normalizeAxiosError } from "../types";

import type {
    CategoryProductsParams,
    CategoryResponse,
    CategoryWithChildren,
    CategoryWithProductsResponse,
} from "./types";

// API endpoint
const CATEGORIES_ENDPOINT = "/v1/categories";

/**
 * API çağrısı sonucu
 */
type CategoryApiResult<T> =
    | { success: true; data: T }
    | { success: false; error: ApiError };

export const categoryService = {
    /**
     * Tüm kategorileri listele
     * GET /api/v1/categories/
     */
    getAll: async (): Promise<CategoryApiResult<CategoryResponse[]>> => {
        try {
            const response = await httpClient.get<CategoryResponse[]>(
                `${CATEGORIES_ENDPOINT}/`
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
    },

    /**
     * Kategori ağacını getir (parent-child yapısı)
     * GET /api/v1/categories/tree
     */
    getTree: async (): Promise<CategoryApiResult<CategoryWithChildren[]>> => {
        try {
            const response = await httpClient.get<CategoryWithChildren[]>(
                `${CATEGORIES_ENDPOINT}/tree`
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
    },

    /**
     * Kategori detayı ve ürünlerini getir
     * GET /api/v1/categories/{identifier}
     *
     * @param identifier - Kategori ID veya slug
     * @param params - Filtreleme ve pagination parametreleri
     */
    getWithProducts: async (
        identifier: string,
        params: CategoryProductsParams = {}
    ): Promise<CategoryApiResult<CategoryWithProductsResponse>> => {
        try {
            // Query params oluştur
            const queryParams = new URLSearchParams();

            if (params.page !== undefined) {
                queryParams.set("page", String(params.page));
            }
            if (params.page_size !== undefined) {
                queryParams.set("page_size", String(params.page_size));
            }
            if (params.min_price !== undefined) {
                queryParams.set("min_price", String(params.min_price));
            }
            if (params.max_price !== undefined) {
                queryParams.set("max_price", String(params.max_price));
            }
            if (params.brand) {
                queryParams.set("brand", params.brand);
            }
            if (params.in_stock_only !== undefined) {
                queryParams.set("in_stock_only", String(params.in_stock_only));
            }

            const queryString = queryParams.toString();
            const url = queryString
                ? `${CATEGORIES_ENDPOINT}/${identifier}?${queryString}`
                : `${CATEGORIES_ENDPOINT}/${identifier}`;

            const response =
                await httpClient.get<CategoryWithProductsResponse>(url);

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
    },

    /**
     * Sadece kategori bilgisini getir (ürünler olmadan)
     * İlk sayfa ile birlikte döner, ürünleri ignore eder
     */
    get: async (
        identifier: string
    ): Promise<CategoryApiResult<CategoryResponse>> => {
        const result = await categoryService.getWithProducts(identifier, {
            page_size: 1,
        });

        if (result.success) {
            return {
                success: true,
                data: result.data.category,
            };
        }

        return result;
    },
};

// Type exports
export type {
    CategoryProductsParams,
    CategoryResponse,
    CategoryWithChildren,
    CategoryWithProductsResponse,
};
