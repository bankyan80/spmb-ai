// API helper — auto-injects Firebase auth token from Zustand store

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  // Lazy import store to avoid circular deps
  const { useSpmbStore } = await import('./store');
  return useSpmbStore.getState().authToken;
}

type RequestOptions = RequestInit & {
  params?: Record<string, string | undefined>;
};

export async function api<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { params, ...fetchOpts } = options;

  let url = `${API_BASE}${path}`;
  if (params) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) search.set(k, v);
    });
    const qs = search.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    ...(fetchOpts.headers as Record<string, string>),
  };

  const token = await getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(fetchOpts.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, { ...fetchOpts, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, body.error || `Request failed (${res.status})`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/csv')) {
    return (await res.text()) as unknown as T;
  }

  return res.json() as Promise<T>;
}

// Convenience methods
export const apiService = {
  get: <T>(path: string, params?: Record<string, string | undefined>) =>
    api<T>(path, { method: 'GET', params }),

  post: <T>(path: string, body?: unknown) =>
    api<T>(path, {
      method: 'POST',
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body: unknown) =>
    api<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: <T>(path: string, params?: Record<string, string>) =>
    api<T>(path, { method: 'DELETE', params }),

  upload: <T>(path: string, formData: FormData) =>
    api<T>(path, {
      method: 'POST',
      body: formData,
    }),
};
