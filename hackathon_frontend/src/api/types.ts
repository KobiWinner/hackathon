import axios from "axios";

export type ApiError = {
  status?: number;
  message: string;
  data?: unknown;
  isNetworkError: boolean;
};

export type ApiResponse<TData> = {
  data: TData;
};

export const normalizeAxiosError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;
    const responseMessage =
      (typeof responseData === "object" &&
        responseData !== null &&
        "message" in responseData &&
        typeof (responseData as { message?: unknown }).message === "string" &&
        (responseData as { message?: string }).message) ||
      (typeof responseData === "string" ? responseData : undefined);

    return {
      status: error.response?.status,
      message: responseMessage ?? error.message ?? "Bilinmeyen bir hata oluştu.",
      data: responseData,
      isNetworkError: !error.response,
    };
  }

  return {
    message:
      error instanceof Error
        ? error.message
        : "Beklenmeyen bir hata oluştu.",
    isNetworkError: false,
  };
};
