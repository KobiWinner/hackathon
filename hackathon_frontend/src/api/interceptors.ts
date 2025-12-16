import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

export type InterceptorOptions = {
  getAuthToken?: () => string | null;
  onUnauthorized?: () => void;
  retryCount?: number;
  retryDelayMs?: number;
};

export type RetryableConfig = InternalAxiosRequestConfig & { __retryCount?: number };

const RETRY_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

/**
 * Request'e Authorization header ekler
 */
const addAuthHeader = (
  config: InternalAxiosRequestConfig,
  getAuthToken?: () => string | null,
): InternalAxiosRequestConfig => {
  if (!getAuthToken) {
    return config;
  }

  const token = getAuthToken();

  if (!token) {
    return config;
  }

  // Headers zaten var mı kontrol et, yoksa oluştur
  if (!config.headers) {
    config.headers = {} as typeof config.headers;
  }

  // Authorization header'ı yoksa ekle
  if (!config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

/**
 * Hata retry edilebilir mi kontrol eder
 */
export const isRetryableError = (error: AxiosError): boolean => {
  const status = error.response?.status;

  if (error.code === "ECONNABORTED") {
    return true;
  }

  if (!status) {
    return true;
  }

  return RETRY_STATUS_CODES.has(status);
};

/**
 * Belirtilen süre bekler
 */
export const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    if (!ms) {
      resolve();
      return;
    }
    setTimeout(resolve, ms);
  });

/**
 * Axios instance'a interceptor'ları ekler
 */
export const attachInterceptors = (
  client: AxiosInstance,
  options: InterceptorOptions = {},
): void => {
  // Request interceptor - Auth header ekle
  client.interceptors.request.use(
    (config) => addAuthHeader(config, options.getAuthToken),
    (error) => Promise.reject(error)
  );

  // Response interceptor - 401 ve retry yönetimi
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      // 401 Unauthorized - token geçersiz/expired
      if (error.response?.status === 401 && options.onUnauthorized) {
        options.onUnauthorized();
        return Promise.reject(error);
      }

      // Retry mekanizması
      const config = error.config as RetryableConfig | undefined;
      const maxRetries = options.retryCount ?? 0;

      if (config && isRetryableError(error) && maxRetries > 0) {
        config.__retryCount = config.__retryCount ?? 0;

        if (config.__retryCount < maxRetries) {
          config.__retryCount += 1;
          await wait(options.retryDelayMs ?? 1000);
          return client.request(config);
        }
      }

      return Promise.reject(error);
    }
  );
};
