const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
export const SERVER_BACKEND_ROOT = API_BASE_URL.replace(/\/api\/?$/, '');

type FetchOptions = {
  searchParams?: Record<string, string | number | undefined>;
  revalidate?: number | false;
  cache?: RequestCache;
};

function buildUrl(path: string, searchParams?: FetchOptions['searchParams']): string {
  const base = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  if (!searchParams) return base;
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined || value === '') continue;
    usp.set(key, String(value));
  }
  const qs = usp.toString();
  return qs ? `${base}?${qs}` : base;
}

export async function serverFetch<T>(path: string, options: FetchOptions = {}): Promise<T | null> {
  const { searchParams, revalidate, cache } = options;
  const url = buildUrl(path, searchParams);

  const init: RequestInit & { next?: { revalidate?: number | false } } = {
    headers: { 'Content-Type': 'application/json' },
  };
  if (cache) {
    init.cache = cache;
  } else if (revalidate !== undefined) {
    init.next = { revalidate };
  } else {
    init.cache = 'no-store';
  }

  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      console.error(`serverFetch ${path} failed: ${res.status} ${res.statusText}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`serverFetch ${path} threw:`, err);
    return null;
  }
}
