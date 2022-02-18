import {SanityClient} from "@sanity/client"

export interface TokenDocument {
  _id: string
  _type: string
  _updatedAt: string
  token: string
  displayName?: string
  comment?: string
}

export type TokenDocumentAttributes = Omit<
  TokenDocument,
  "_id" | "_type" | "_updatedAt"
>

export function getAllTokens(client: SanityClient): Promise<TokenDocument[]> {
  return client.fetch(
    `*[_type == 'crossDatasetToken' && _id in path('secrets.sanity.sharedContent.**')]`,
  )
}

export function fetchTokenDocument(
  client: SanityClient,
  id: string,
): Promise<TokenDocument> {
  return client.fetch(`*[_id == $id][0]`, {
    id,
  })
}

export async function deleteToken(
  client: SanityClient,
  id: string,
): Promise<unknown> {
  return client.delete(id)
}

export async function saveToken(
  client: SanityClient,
  id: string,
  attributes: TokenDocumentAttributes,
): Promise<unknown> {
  const tr = client
    .transaction()
    .createIfNotExists({_id: id, _type: "crossDatasetToken"})
    .patch(id, p => p.set(attributes))

  return tr.commit()
}
