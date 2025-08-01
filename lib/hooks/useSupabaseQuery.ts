import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface SupabaseQueryOptions {
  enabled?: boolean
  staleTime?: number
  retry?: number
}

export interface QueryState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useSupabaseQuery<T>(
  queryKey: string,
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options: SupabaseQueryOptions = {}
): QueryState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const { enabled = true, retry = 3 } = options

  const executeQuery = useCallback(async () => {
    if (!enabled) return

    setLoading(true)
    setError(null)

    let attempts = 0
    while (attempts <= retry) {
      try {
        const result = await queryFn()
        
        if (result.error) {
          throw new Error(result.error.message)
        }

        setData(result.data)
        setLoading(false)
        return
      } catch (err) {
        attempts++
        if (attempts > retry) {
          setError(err instanceof Error ? err : new Error('Unknown error'))
          setLoading(false)
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts))
        }
      }
    }
  }, [queryFn, enabled, retry])

  const refetch = useCallback(async () => {
    await executeQuery()
  }, [executeQuery])

  useEffect(() => {
    executeQuery()
  }, [executeQuery])

  return { data, loading, error, refetch }
}

export function useSupabaseRealtime<T>(
  table: string,
  filter?: { column: string; value: string }
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let query = supabase
      .from(table)
      .select('*')

    if (filter) {
      query = query.eq(filter.column, filter.value)
    }

    const fetchData = async () => {
      const { data: initialData, error: initialError } = await query
      
      if (initialError) {
        setError(new Error(initialError.message))
      } else {
        setData(initialData || [])
      }
      setLoading(false)
    }

    fetchData()

    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setData(prev => [...prev, payload.new as T])
          } else if (payload.eventType === 'UPDATE') {
            setData(prev => 
              prev.map(item => 
                (item as any).id === payload.new.id ? payload.new as T : item
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setData(prev => 
              prev.filter(item => (item as any).id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, filter])

  return { data, loading, error, setData }
}