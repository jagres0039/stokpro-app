const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1"

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("token")
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) {
    throw new Error(`API error ${res.status}`)
  }
  return (await res.json()) as T
}
