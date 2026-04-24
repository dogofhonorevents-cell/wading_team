import { getFirebaseAuth } from "./firebase";
import type { ApiResponse } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function getAuthToken(): Promise<string | null> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  skipAuth?: boolean;
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, skipAuth, headers: headersInit, ...rest } = options;

  const headers = new Headers(headersInit);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

  if (!skipAuth) {
    const token = await getAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const url = path.startsWith("http") ? path : `${API_URL}${path}`;

  const res = await fetch(url, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  let payload: unknown;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const p = payload as { message?: string; details?: unknown } | null;
    throw new ApiError(
      res.status,
      p?.message ?? `Request failed: ${res.status}`,
      p?.details
    );
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> =>
    apiFetch<ApiResponse<T>>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> =>
    apiFetch<ApiResponse<T>>(path, { ...options, method: "POST", body }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> =>
    apiFetch<ApiResponse<T>>(path, { ...options, method: "PATCH", body }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> =>
    apiFetch<ApiResponse<T>>(path, { ...options, method: "PUT", body }),

  delete: <T = void>(path: string, options?: RequestOptions): Promise<T> =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
};
