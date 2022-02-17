import {route} from "@sanity/base/router"
import {TokenIcon} from "@sanity/icons"
import {CrossDatasetTokenToolProvider} from "./CrossDatasetTokenToolProvider"

export default {
  name: "crossDatasetTokens",
  title: "Cross dataset tokens",
  component: CrossDatasetTokenToolProvider,
  router: route("/:action", ({action}) =>
    action === "edit"
      ? [route(":projectId/:dataset/:tokenId"), route(":projectId/:dataset")]
      : [],
  ),
  icon: TokenIcon,
}
