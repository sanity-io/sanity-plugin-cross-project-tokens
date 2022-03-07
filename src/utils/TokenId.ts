export interface Token {
  projectId: string
  tokenId?: string
}

const TOKEN_PATH = `secrets.sanity.sharedContent`

export function fromDocumentId(documentId: string): Token {
  if (!documentId.startsWith(TOKEN_PATH)) {
    throw new Error(
      "Unexpected document id. The `_id` of a cross project token document should begin with `secrets.sanity.sharedContent`",
    )
  }
  const [, , , projectId, tokenId] = documentId.split(".")
  return {projectId: projectId!, tokenId}
}

export function toDocumentId(token: Token): string {
  return [TOKEN_PATH, token.projectId, token.tokenId].filter(Boolean).join(".")
}

export function parse(tokenString: string) {
  const [projectId, tokenId] = tokenString.split(".")
  if (!projectId) {
    throw new Error("Invalid token id string")
  }
  return {projectId, tokenId}
}

export function stringify(token: Token) {
  return [token.projectId, token.tokenId].filter(Boolean).join(".")
}
