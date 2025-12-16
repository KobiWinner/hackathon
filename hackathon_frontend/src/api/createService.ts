
import { httpClient } from "./httpClient";
import { type ApiError, normalizeAxiosError } from "./types";

import type { AxiosInstance } from "axios";

// ==================== Types ====================

/**
 * API sonuç tipi - her API çağrısı bu yapıyı döner
 */
export type ApiResult<T> =
    | { success: true; data: T }
    | { success: false; error: ApiError };

/**
 * Sayfalama parametreleri
 */
export type PaginationParams = {
    page?: number;
    pageSize?: number;
    skip?: number;
    limit?: number;
};

/**
 * Sıralama parametreleri
 */
export type SortParams = {
    sortBy?: string;
    sortOrder?: "asc" | "desc";
};

/**
 * Arama/Filtreleme parametreleri
 */
export type FilterParams = {
    filters?: Array<{
        field: string;
        operator: string;
        value: string | number | boolean;
    }>;
};

/**
 * Query parametreleri (pagination + sort + filter)
 */
export type QueryParams = PaginationParams & SortParams & FilterParams;

/**
 * Sayfalanmış yanıt tipi
 */
export type PaginatedResponse<T> = {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
};

// ==================== CRUD Service Factory ====================

/**
 * CRUD servis arayüzü
 */
export type CrudService<
    TResponse,
    TCreate = Partial<TResponse>,
    TUpdate = Partial<TResponse>,
    TId = number | string
> = {
    /** Tüm kayıtları getir */
    getAll: (params?: QueryParams) => Promise<ApiResult<TResponse[]>>;
    /** ID ile tek kayıt getir */
    getById: (id: TId) => Promise<ApiResult<TResponse>>;
    /** Yeni kayıt oluştur */
    create: (data: TCreate) => Promise<ApiResult<TResponse>>;
    /** Kayıt güncelle */
    update: (id: TId, data: TUpdate) => Promise<ApiResult<TResponse>>;
    /** Kayıt sil */
    delete: (id: TId) => Promise<ApiResult<TResponse>>;
    /** Arama yap */
    search: (params: QueryParams) => Promise<ApiResult<TResponse[]>>;
    /** Raw endpoint'e erişim */
    endpoint: string;
    /** Raw client'a erişim */
    client: AxiosInstance;
};

/**
 * CRUD Servis Factory Options
 */
export type CreateServiceOptions = {
    /** HTTP client (varsayılan: httpClient) */
    client?: AxiosInstance;
    /** Search endpoint'i (varsayılan: /search) */
    searchEndpoint?: string;
    /** ID parametresi için özel path builder */
    idPath?: (id: number | string) => string;
};

/**
 * Generic CRUD Servis Factory
 * 
 * Tek satırda tam fonksiyonel bir CRUD servisi oluşturur.
 * 
 * @example
 * ```typescript
 * // Basit kullanım
 * const userService = createCrudService<User, UserCreate, UserUpdate>('/users');
 * 
 * // Kullanım
 * const users = await userService.getAll();
 * const user = await userService.getById(1);
 * const newUser = await userService.create({ name: 'John' });
 * await userService.update(1, { name: 'Jane' });
 * await userService.delete(1);
 * 
 * // Özel seçenekler
 * const productService = createCrudService<Product>('/products', {
 *     searchEndpoint: '/query',
 *     idPath: (id) => `/item/${id}`,
 * });
 * ```
 */
export function createCrudService<
    TResponse,
    TCreate = Partial<TResponse>,
    TUpdate = Partial<TResponse>,
    TId extends number | string = number
>(
    baseEndpoint: string,
    options: CreateServiceOptions = {}
): CrudService<TResponse, TCreate, TUpdate, TId> {
    const {
        client = httpClient,
        searchEndpoint = "/search",
        idPath = (id: TId) => `/${id}`,
    } = options;

    const endpoint = baseEndpoint.endsWith("/")
        ? baseEndpoint.slice(0, -1)
        : baseEndpoint;

    /**
     * Güvenli API çağrısı wrapper'ı
     */
    const safeCall = async <T>(
        fn: () => Promise<T>
    ): Promise<ApiResult<T>> => {
        try {
            const result = await fn();
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: normalizeAxiosError(error) };
        }
    };

    return {
        endpoint,
        client,

        getAll: async (params?: QueryParams) => {
            return safeCall(async () => {
                const response = await client.get<TResponse[]>(endpoint, { params });
                return response.data;
            });
        },

        getById: async (id: TId) => {
            return safeCall(async () => {
                const response = await client.get<TResponse>(`${endpoint}${idPath(id)}`);
                return response.data;
            });
        },

        create: async (data: TCreate) => {
            return safeCall(async () => {
                const response = await client.post<TResponse>(endpoint, data);
                return response.data;
            });
        },

        update: async (id: TId, data: TUpdate) => {
            return safeCall(async () => {
                const response = await client.put<TResponse>(
                    `${endpoint}${idPath(id)}`,
                    data
                );
                return response.data;
            });
        },

        delete: async (id: TId) => {
            return safeCall(async () => {
                const response = await client.delete<TResponse>(
                    `${endpoint}${idPath(id)}`
                );
                return response.data;
            });
        },

        search: async (params: QueryParams) => {
            return safeCall(async () => {
                const response = await client.post<TResponse[]>(
                    `${endpoint}${searchEndpoint}`,
                    params
                );
                return response.data;
            });
        },
    };
}

// ==================== Extended Service Builder ====================

/**
 * Özel metodlar eklenebilir servis oluşturucu
 * 
 * @example
 * ```typescript
 * const userService = extendCrudService(
 *     createCrudService<User>('/users'),
 *     (base) => ({
 *         getByEmail: async (email: string) => 
 *             base.search({ filters: [{ field: 'email', operator: 'eq', value: email }] }),
 *         
 *         getActive: async () => 
 *             base.search({ filters: [{ field: 'status', operator: 'eq', value: 'active' }] }),
 *     })
 * );
 * 
 * // Kullanım
 * const users = await userService.getActive();
 * const user = await userService.getByEmail('john@example.com');
 * ```
 */
export function extendCrudService<
    TResponse,
    TCreate,
    TUpdate,
    TId extends number | string,
    TExtensions extends Record<string, unknown>
>(
    baseService: CrudService<TResponse, TCreate, TUpdate, TId>,
    extensions: (base: CrudService<TResponse, TCreate, TUpdate, TId>) => TExtensions
): CrudService<TResponse, TCreate, TUpdate, TId> & TExtensions {
    return {
        ...baseService,
        ...extensions(baseService),
    };
}

// ==================== Utility Functions ====================

/**
 * Batch işlemler için yardımcı
 */
export async function batchApiCalls<T>(
    calls: Array<() => Promise<ApiResult<T>>>
): Promise<ApiResult<T>[]> {
    return Promise.all(calls.map((call) => call()));
}

/**
 * İlk başarılı sonucu döndür
 */
export async function firstSuccessful<T>(
    calls: Array<() => Promise<ApiResult<T>>>
): Promise<ApiResult<T>> {
    for (const call of calls) {
        const result = await call();
        if (result.success) {
            return result;
        }
    }
    return {
        success: false,
        error: {
            message: "Tüm API çağrıları başarısız oldu.",
            isNetworkError: false,
        },
    };
}
