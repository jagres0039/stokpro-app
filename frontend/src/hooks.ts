import { useCallback, useEffect, useState } from "react"

import { api } from "./api/client"

type ListState<T> = {
  data: T[]
  loading: boolean
  error: string | null
  reload: () => void
}

export function useList<T>(path: string): ListState<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    api
      .get<T[]>(path)
      .then(setData)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Gagal memuat data"),
      )
      .finally(() => setLoading(false))
  }, [path])

  useEffect(() => {
    reload()
  }, [reload])

  return { data, loading, error, reload }
}
