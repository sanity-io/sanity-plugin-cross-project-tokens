import React, {useCallback, useMemo} from "react"
import ReactDOM from "react-dom"
import {
  Button,
  studioTheme,
  ThemeProvider,
  ToastProvider,
  useToast,
} from "@sanity/ui"
import {CrossDatasetTokenRoot} from "./src"
import {RouterProvider, useRouterState} from "@sanity/base/router"
import createClient from "@sanity/client"
import {validateRouterState} from "./src/utils/validateRouterState"
import {router} from "./src/router"

const client = createClient({
  projectId: "ppsg7ml5",
  dataset: "playground",
  withCredentials: true,
})

function navigate(path: string) {
  window.location.hash = path
}

function navigateState(nextState: Record<string, any>) {
  navigate(router.encode(nextState))
}

function DemoProvider(props: {children: React.ReactNode}) {
  const state = router.decode(document.location.hash.substring(1))
  return (
    <ThemeProvider theme={studioTheme}>
      <ToastProvider>
        <RouterProvider
          router={router}
          state={state || {}}
          onNavigate={navigate}
        >
          {props.children}
        </RouterProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

function Demo() {
  const toast = useToast()
  const routerState = useRouterState()

  const notify = useCallback(
    (notification: {title: string; status: "success" | "info"}) => {
      return toast.push(notification)
    },
    [toast],
  )

  return (
    <CrossDatasetTokenRoot
      client={client}
      navigate={navigateState}
      notify={notify}
      params={routerState ? validateRouterState(routerState) : null}
    />
  )
}

function render() {
  ReactDOM.render(
    <React.StrictMode>
      <DemoProvider>
        <Demo />
      </DemoProvider>
    </React.StrictMode>,
    document.getElementById("root"),
  )
}

window.addEventListener("hashchange", render)
render()
