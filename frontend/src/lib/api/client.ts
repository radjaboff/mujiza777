import { ApiError } from './types';

const isServer = typeof window === 'undefined';
const API_BASE = isServer
  ? process.env.API_INTERNAL_URL || 'http://127.0.0.1:8081'
  : '';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | string[] | undefined>;
  lang?: 'uz' | 'ru';
  timeoutMs?: number;
  revalidate?: number | false;
}

/** Reuse a checkout key for retries with the same payload, but rotate it if the cart/form changed. */
export function checkoutIdempotencyKey(storageKey: string, payload: unknown): string {
  const fingerprint = JSON.stringify(payload);
  const saved = window.sessionStorage.getItem(storageKey);
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as { fingerprint?: string; key?: string };
      if (parsed.fingerprint === fingerprint && parsed.key) return parsed.key;
    } catch {
      // Replace malformed/stale session data with a fresh key.
    }
  }
  const key = crypto.randomUUID();
  window.sessionStorage.setItem(storageKey, JSON.stringify({ fingerprint, key }));
  return key;
}

export function clearCheckoutIdempotencyKey(storageKey: string): void {
  window.sessionStorage.removeItem(storageKey);
}

// Backend offline bo'lganda so'rovlarni soniyalar davomida osiltirib qo'ymaslik uchun Circuit Breaker
let isBackendOffline = false;
let lastOfflineCheck = 0;
const OFFLINE_RETRY_INTERVAL = 10000; // 10 soniyada bir marta qayta tekshiradi

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const defaultTimeout = 10000;
  const { params, lang, headers = {}, timeoutMs = defaultTimeout, revalidate, ...rest } = options;

  // Agar backend yoniq emasligi yaqinda aniqlangan bo'lsa, 0 ms da tezkor qaytaradi (pauzasiz)
  const now = Date.now();
  if (isBackendOffline && now - lastOfflineCheck < OFFLINE_RETRY_INTERVAL) {
    throw {
      timestamp: new Date().toISOString(),
      status: 503,
      error: 'Backend Offline',
      message: 'Backend server vaqtincha offline',
      path: endpoint,
      fieldErrors: null,
    } as ApiError;
  }

  const url = new URL(endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`, 'http://127.0.0.1:3000');

  if (lang) {
    url.searchParams.set('lang', lang);
  }

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach((v) => url.searchParams.append(key, String(v)));
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    });
  }

  const finalUrl = isServer ? url.toString() : `${url.pathname}${url.search}`;

  // Tezkor Timeout
  let signal = rest.signal;
  if (!signal && typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    try {
      signal = AbortSignal.timeout(timeoutMs);
    } catch {}
  }

  const fetchOptions: RequestInit & { next?: { revalidate?: number | false } } = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
    signal,
    ...rest,
  };

  if (isServer && (!rest.method || rest.method.toUpperCase() === 'GET')) {
    fetchOptions.next = {
      revalidate: revalidate !== undefined ? revalidate : 60,
    };
  }

  try {
    const response = await fetch(finalUrl, fetchOptions);

    if (!response.ok) {
      let errorData: ApiError;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          timestamp: new Date().toISOString(),
          status: response.status,
          error: response.statusText,
          message: 'Kutilmagan server xatoligi yuz berdi',
          path: endpoint,
          fieldErrors: null,
        };
      }
      throw errorData;
    }

    // Muvaffaqiyatli bo'lsa, backend online deb belgilanadi
    isBackendOffline = false;

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  } catch (error: any) {
    // Agar ulanish rad etilgan bo'lsa (backend o'chiq bo'lsa)
    const isConnRefused = 
      error?.cause?.code === 'ECONNREFUSED' || 
      error?.code === 'ECONNREFUSED' ||
      error?.message?.includes('fetch failed');

    if (isConnRefused) {
      isBackendOffline = true;
      lastOfflineCheck = Date.now();
    }
    throw error;
  }
}
