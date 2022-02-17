export function validateRouterState(routerState: Record<string, unknown>) {
  if (routerState.action === "edit") {
    if (!routerState.dataset || !routerState.projectId) {
      return null
    }
    return {
      action: "edit",
      dataset: routerState.dataset as string,
      projectId: routerState.projectId as string,
      tokenId: routerState.tokenId as string | undefined,
    } as const
  }
  if (routerState.action === "new") {
    return {action: "new"} as const
  }
  return null
}
