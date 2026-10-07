import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Page } from '../types'

/** GET a path once, and again whenever the path changes or reload() is called. */
export function useApi<T>(path: string) {
  const [result, setResult] = useState<{ path: string; data: T | null; error: string }>({ path: '', data: null, error: '' })
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let cancelled = false
    api<T>(path)
      .then((data) => !cancelled && setResult({ path, data, error: '' }))
      .catch((err: Error) => !cancelled && setResult({ path, data: null, error: err.message }))
    return () => {
      cancelled = true
    }
  }, [path, nonce])

  // Results for an older path are ignored, which is also what makes loading true after a path change
  const current = result.path === path
  return {
    data: current ? result.data : null,
    error: current ? result.error : '',
    loading: !current,
    reload: () => setNonce((n) => n + 1),
  }
}

/** Like useApi, but keeps refetching every 3 seconds until the item reaches a final status. */
export function usePolledItem<T extends { status: string }>(path: string, finalStatuses: string[]) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let cancelled = false
    let timer: number
    async function poll() {
      try {
        const item = await api<T>(path)
        if (cancelled) return
        setData(item)
        setError('')
        if (finalStatuses.includes(item.status)) return
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Something went wrong')
        // A missing item will not appear later, so only transient failures keep polling
        if (err instanceof Error && err.message === 'Recording not found') return
      }
      timer = window.setTimeout(poll, 3000)
    }
    poll()
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [path, nonce, finalStatuses])

  return { data, error, restart: () => setNonce((n) => n + 1) }
}

/** Cursor-paged list. Starts over when the path (including its filters) changes. */
export function useCursorList<T extends { id: string }>(path: string) {
  const [state, setState] = useState<{ path: string; items: T[]; nextCursor: string | null; error: string }>({
    path: '',
    items: [],
    nextCursor: null,
    error: '',
  })
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    let cancelled = false
    api<Page<T>>(path)
      .then((page) => !cancelled && setState({ path, items: page.items, nextCursor: page.nextCursor, error: '' }))
      .catch((err: Error) => !cancelled && setState({ path, items: [], nextCursor: null, error: err.message }))
    return () => {
      cancelled = true
    }
  }, [path])

  async function loadMore() {
    if (!state.nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const separator = path.includes('?') ? '&' : '?'
      const page = await api<Page<T>>(`${path}${separator}cursor=${state.nextCursor}`)
      setState((s) => (s.path === path ? { ...s, items: [...s.items, ...page.items], nextCursor: page.nextCursor } : s))
    } catch (err) {
      setState((s) => ({ ...s, error: err instanceof Error ? err.message : 'Something went wrong' }))
    } finally {
      setLoadingMore(false)
    }
  }

  const current = state.path === path
  return {
    items: current ? state.items : [],
    loading: !current || loadingMore,
    error: current ? state.error : '',
    hasMore: current && state.nextCursor !== null,
    loadMore,
  }
}
