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
  'http://localhost:3000';

/**
 * Helper fetch dengan base URL dan default headers.
 * Otomatis inject Authorization header jika ada token di cookie (client-side).
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const url = `${API}${path}`;
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}
