// import axios from "axios";

// import { normalizeAxiosError } from "./types";

import type {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

type _InterceptorOptions = {
  getAuthToken?: () => string | null;
  onUnauthorized?: () => void;
  retryCount?: number;
  retryDelayMs?: number;
};

const _addAuthHeader = (
  config: InternalAxiosRequestConfig,
  getAuthToken?: () => string | null,
) => {
  if (!getAuthToken) {
    return config;
  }

  const token = getAuthToken();

  if (!token) {
    return config;
  }

  const headers = config.headers ?? {};

  return {
    ...config,
    headers: {
      ...headers,
      Authorization:
        (headers as Record<string, string | undefined>).Authorization ??
        `Bearer ${token}`,
    },
  };
};

export type RetryableConfig = InternalAxiosRequestConfig & { __retryCount?: number };

const RETRY_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

export const isRetryableError = (error: AxiosError) => {
  const status = error.response?.status;

  if (error.code === "ECONNABORTED") {
    return true;
  }

  if (!status) {
    return true;
  }

  return RETRY_STATUS_CODES.has(status);
};

export const wait = (ms: number) =>
  new Promise((resolve) => {
    if (!ms) {
      resolve(null);
      return;
    }

    setTimeout(resolve, ms);
  });
