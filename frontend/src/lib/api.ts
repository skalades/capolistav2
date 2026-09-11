/**
 * Centralized API base URL.
 * Semua fetch ke backend wajib pakai konstanta ini, bukan hardcode string.
 *
 * - Server-side (SSR/Server Actions): INTERNAL_API_URL → lebih cepat karena loopback
 * - Client-side (browser): NEXT_PUBLIC_API_URL
 */
export const API =
  (typeof window === 'undefined'
    ? process.env.INTERNAL_API_URL
    : undefined) ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:3005';

/**
 * Helper fetch dengan base URL dan default headers.
 * Di server-side, ia menembak langsung ke BACKEND_URL (jangan lupa manual pasang header auth).
 * Di client-side, ia menembak ke /api/proxy agar token cookie otomatis di-attach oleh Next.js server.
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const isClient = typeof window !== 'undefined';
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  const url = isClient ? `/api/proxy/${cleanPath}` : `${API}/${cleanPath}`;
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}
