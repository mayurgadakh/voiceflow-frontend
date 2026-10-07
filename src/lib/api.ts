const baseUrl = import.meta.env.VITE_API_URL ?? ''

export async function api<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const res = await fetch(`${baseUrl}/api${path}`, {
    method: init?.method ?? 'GET',
    credentials: 'include',
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
    body: init?.body ? JSON.stringify(init.body) : undefined,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error?.message ?? 'Something went wrong')
  return data as T
}
