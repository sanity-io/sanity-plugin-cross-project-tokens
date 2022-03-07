import {TokenIcon} from "@sanity/icons"
import {CrossProjectTokensTool} from "./CrossProjectTokensTool"
import {router} from "./router"

export default {
  name: "crossProjectTokens",
  title: "Cross project tokens",
  component: CrossProjectTokensTool,
  router,
  icon: TokenIcon,
}
