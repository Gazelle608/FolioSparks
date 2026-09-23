import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";

import { type ApiResult, err, ok, supabase } from "./supabase";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const API_URL
  = (import.meta as ImportMeta & { env: { VITE_API_URL?: string } }).env.VITE_API_URL
    ?? "http://localhost:4000";

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------
export const http: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

// ---------------------------------------------------------------------------
// Attach Supabase access token to every request
// ---------------------------------------------------------------------------
http.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------------------------------------------------------------------------
// Normalize errors into { data, error }
// ---------------------------------------------------------------------------
function normalizeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axErr = error as AxiosError<{ error?: string; message?: string }>;
    return (
      axErr.response?.data?.error
      ?? axErr.response?.data?.message
      ?? axErr.message
      ?? "Request failed"
    );
  }
  if (error instanceof Error)
    return error.message;
  return "Unknown error";
}

// ---------------------------------------------------------------------------
// Generic request wrapper — every backend call goes through this
// ---------------------------------------------------------------------------
export async function request<T>(
  config: AxiosRequestConfig,
): Promise<ApiResult<T>> {
  try {
    const response = await http.request<T>(config);
    return ok(response.data);
  }
  catch (error) {
    return err(normalizeError(error));
  }
}

// ---------------------------------------------------------------------------
// Convenience helpers (so callers don't write config objects)
// ---------------------------------------------------------------------------
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: "GET", url }),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: "POST", url, data }),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: "PATCH", url, data }),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: "PUT", url, data }),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: "DELETE", url }),
};

// ---------------------------------------------------------------------------
// Health check (used in dev)
// ---------------------------------------------------------------------------
export async function healthCheck(): Promise<ApiResult<{ status: string }>> {
  return api.get<{ status: string }>("/health");
}
