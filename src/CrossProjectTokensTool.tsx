import React, {useCallback, useMemo} from "react"
import {useRouter, useRouterState} from "@sanity/base/router"
import {useToast, ToastParams} from "@sanity/ui"
import studioClient from "part:@sanity/base/client"
import {CrossProjectTokensRoot} from "./CrossProjectTokensUI"
import {validateRouterState} from "./utils/validateRouterState"

export function CrossProjectTokensTool() {
  const toast = useToast()
  const {navigate} = useRouter()
  const routerState = useRouterState()
  const notify = useCallback(
    (args: ToastParams) => {
      toast.push(args)
    },
    [toast],
  )

  const params = useMemo(() => validateRouterState(routerState), [routerState])
  return (
    <CrossProjectTokensRoot
      client={studioClient}
      notify={notify}
      navigate={navigate}
      params={params}
    />
  )
}
