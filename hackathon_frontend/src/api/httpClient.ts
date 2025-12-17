import axios from "axios";

import { getToken, removeToken } from "./auth/tokenService";
import { attachInterceptors } from "./interceptors";

import type { AxiosInstance } from "axios";

type HttpClientOptions = {
  baseURL?: string;
  timeoutMs?: number;
  getAuthToken?: () => string | null;
  onUnauthorized?: () => void;
  retryCount?: number;
  retryDelayMs?: number;
};

const parseNumberEnv = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// Backend API base URL - .env'den alınır, yoksa localhost:8000 kullanılır
const DEFAULT_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

const DEFAULT_TIMEOUT = parseNumberEnv(
  process.env.NEXT_PUBLIC_API_TIMEOUT_MS,
  15_000,
);

const DEFAULT_RETRY_COUNT = parseNumberEnv(
  process.env.NEXT_PUBLIC_API_RETRY_COUNT,
  2,
);

const DEFAULT_RETRY_DELAY_MS = parseNumberEnv(
  process.env.NEXT_PUBLIC_API_RETRY_DELAY_MS,
  1_000,
);

/**
 * HTTP client factory - özelleştirilmiş axios instance oluşturur
 */
export const createHttpClient = (
  options: HttpClientOptions = {},
): AxiosInstance => {
  const client = axios.create({
    baseURL: options.baseURL ?? DEFAULT_BASE_URL,
    timeout: options.timeoutMs ?? DEFAULT_TIMEOUT,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    withCredentials: true,
  });

  // Interceptor'ları ekle
  attachInterceptors(client, {
    getAuthToken: options.getAuthToken ?? getToken,
    onUnauthorized: options.onUnauthorized ?? (() => {
      // Token geçersiz olduğunda temizle
      removeToken();
    }),
    retryCount: options.retryCount ?? DEFAULT_RETRY_COUNT,
    retryDelayMs: options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS,
  });

  return client;
};

/**
 * Default HTTP client instance
 */
export const httpClient = createHttpClient();
