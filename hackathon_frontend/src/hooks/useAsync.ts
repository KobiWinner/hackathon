'use client';

import { useCallback, useState } from 'react';

type AsyncState<T> = {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
};

type UseAsyncOptions<T> = {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
};

/**
 * Async işlemler için hook.
 * Loading, error ve data state'lerini yönetir.
 */
export function useAsync<T, Args extends unknown[] = unknown[]>(
    asyncFunction: (...args: Args) => Promise<T>,
    options: UseAsyncOptions<T> = {}
) {
    const [state, setState] = useState<AsyncState<T>>({
        data: null,
        isLoading: false,
        error: null,
    });

    const execute = useCallback(
        async (...args: Args): Promise<T | null> => {
            setState({ data: null, isLoading: true, error: null });

            try {
                const data = await asyncFunction(...args);
                setState({ data, isLoading: false, error: null });
                options.onSuccess?.(data);
                return data;
            } catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                setState({ data: null, isLoading: false, error: err });
                options.onError?.(err);
                return null;
            }
        },
        [asyncFunction, options]
    );

    const reset = useCallback(() => {
        setState({ data: null, isLoading: false, error: null });
    }, []);

    return {
        ...state,
        execute,
        reset,
    };
}

type UseFetchOptions<T> = UseAsyncOptions<T> & {
    /** Otomatik olarak fetch'i çalıştır */
    immediate?: boolean;
};

/**
 * Fetch işlemleri için hook.
 * Python backend API'leri için ideal.
 */
export function useFetch<T>(
    url: string,
    options: UseFetchOptions<T> = {}
) {
    const { immediate = false, ...asyncOptions } = options;

    const fetchData = useCallback(async (): Promise<T> => {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                // TODO: Auth token ekle
                // 'Authorization': `Bearer ${getAuthToken()}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }, [url]);

    const asyncState = useAsync(fetchData, asyncOptions);

    // Immediate fetch
    useState(() => {
        if (immediate) {
            asyncState.execute();
        }
    });

    return asyncState;
}

type MutationMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type UseMutationOptions<T> = UseAsyncOptions<T>;

/**
 * Mutation işlemleri için hook (POST, PUT, DELETE).
 * Python backend API'leri için ideal.
 */
export function useMutation<T, D = unknown>(
    url: string,
    method: MutationMethod = 'POST',
    options: UseMutationOptions<T> = {}
) {
    const mutate = useCallback(
        async (data?: D): Promise<T> => {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    // TODO: Auth token ekle
                    // 'Authorization': `Bearer ${getAuthToken()}`,
                },
                body: data ? JSON.stringify(data) : undefined,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response.json();
        },
        [url, method]
    );

    return useAsync<T, [D?]>(mutate, options);
}
