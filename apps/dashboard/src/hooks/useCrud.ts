import { useState, useCallback, useRef } from 'react'

interface CrudState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useCrud<TData, TArgs = void>(fn: (args: TArgs) => Promise<TData>) {
  const fnRef = useRef(fn)
  fnRef.current = fn

  const [state, setState] = useState<CrudState<TData>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(async (args: TArgs): Promise<TData | undefined> => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const result = await fnRef.current(args)
      setState({ data: result, loading: false, error: null })
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setState((s) => ({ ...s, loading: false, error: message }))
    }
  }, [])

  return { ...state, execute }
}
