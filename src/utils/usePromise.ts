import {useEffect, useState} from "react"

type LoadingState<T> =
  | {type: "loading"}
  | {type: "ok"; result: T}
  | {type: "error"; error: Error}

const INITIAL_PROMISE_STATE = {type: "loading"} as const

export function usePromise<T>(getPromise: () => Promise<T>): LoadingState<T> {
  const [state, setState] = useState<LoadingState<T>>(INITIAL_PROMISE_STATE)

  useEffect(() => {
    let cancelled = false
    setState(INITIAL_PROMISE_STATE)
    getPromise?.()
      .then(
        data => ({type: "ok", result: data} as const),
        err => ({type: "error", error: err} as const),
      )
      .then(settledState => {
        if (!cancelled) {
          setState(settledState)
        }
      })
    return () => {
      cancelled = true
    }
  }, [getPromise])

  return state
}
