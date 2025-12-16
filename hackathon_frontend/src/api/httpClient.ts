import axios from "axios";

//import { attachInterceptors } from "./interceptors";

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

const DEFAULT_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";
const DEFAULT_TIMEOUT = parseNumberEnv(
  process.env.NEXT_PUBLIC_API_TIMEOUT_MS,
  15_000,
);
const _DEFAULT_RETRY_COUNT = parseNumberEnv(
  process.env.NEXT_PUBLIC_API_RETRY_COUNT,
  0,
);
const _DEFAULT_RETRY_DELAY_MS = parseNumberEnv(
  process.env.NEXT_PUBLIC_API_RETRY_DELAY_MS,
  1_000,
);

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

  // attachInterceptors(client, {
  //   getAuthToken: options.getAuthToken,
  //   onUnauthorized: options.onUnauthorized,
  //   retryCount: options.retryCount ?? DEFAULT_RETRY_COUNT,
  //   retryDelayMs: options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS,
  // });

  return client;
};

export const httpClient = createHttpClient();
