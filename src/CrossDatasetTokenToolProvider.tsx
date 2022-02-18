import React, {useCallback, useMemo} from "react"
import {useRouter, useRouterState} from "@sanity/base/router"
import {useToast, ToastParams} from "@sanity/ui"
import studioClient from "part:@sanity/base/client"
import {CrossDatasetTokenRoot} from "./CrossDatasetTokenUI"
import {validateRouterState} from "./utils/validateRouterState"

export function CrossDatasetTokenToolProvider() {
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
    <CrossDatasetTokenRoot
      client={studioClient}
      notify={notify}
      navigate={navigate}
      params={params}
    />
  )
}
