export function validateRouterState(routerState: Record<string, unknown>) {
  if (routerState.action === "new") {
    return {action: "new"} as const
  }
  if (routerState.action === "edit") {
    return typeof routerState.tokenId === "string"
      ? ({action: "edit", tokenId: routerState.tokenId} as const)
      : null
  }
  return null
}
