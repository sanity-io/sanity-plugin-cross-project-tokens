import {TokenIcon} from "@sanity/icons"
import {CrossDatasetTokenToolProvider} from "./CrossDatasetTokenToolProvider"
import {router} from "./router"

export default {
  name: "crossDatasetTokens",
  title: "Cross dataset tokens",
  component: CrossDatasetTokenToolProvider,
  router,
  icon: TokenIcon,
}
