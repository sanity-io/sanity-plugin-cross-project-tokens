import React from "react"
import ReactDOM from "react-dom"
import {ThemeProvider, studioTheme} from "@sanity/ui"
import {CrossDatasetTokenRoot} from "./src"
import {RouterProvider, route} from "@sanity/base/router"
import createClient from "@sanity/client"
import {validateRouterState} from "./src/utils/validateRouterState"

const client = createClient({projectId: "ppsg7ml5", dataset: "test", withCredentials: true})

function navigate(path: string) {
  window.location.hash = path
}

function navigateState(nextState: Record<string, any>) {
  navigate(router.encode(nextState))
}

function notify(notification: {title: string; status: "success" | "info"}) {
  alert(notification.title)
}
const router = route("/:action", ({action}) =>
  action === "edit"
    ? [route(":projectId/:dataset/:tokenId"), route(":projectId/:dataset")]
    : [],
)

function render() {
  const state = router.decode(document.location.hash.substring(1))
  console.log('render')
  ReactDOM.render(
    <React.StrictMode>
      <RouterProvider router={router} state={state || {}} onNavigate={navigate}>
        <ThemeProvider theme={studioTheme}>
          <CrossDatasetTokenRoot
            client={client}
            navigate={navigateState}
            notify={notify}
            params={state ? validateRouterState(state) : null}
          />
        </ThemeProvider>
      </RouterProvider>
    </React.StrictMode>,
    document.getElementById("root"),
  )
}

window.addEventListener("hashchange", render)
render()
