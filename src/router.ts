import {route} from "@sanity/base/router"

export const router = route("/:action", ({action}) =>
  action === "edit" ? [route("/:tokenId")] : [],
)
