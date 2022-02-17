import { SanityClient } from "@sanity/client";

interface Token {
  _id: string;
  _type: string;
  _updatedAt: string;
  token: string;
}
const TOKEN_BASE = `secrets.sanity.sharedContent`;

export function getTokenDocumentId({
  tokenId,
  dataset,
  projectId,
}: {
  dataset: string;
  projectId: string;
  tokenId?: string;
}) {
  return [TOKEN_BASE, projectId, dataset, tokenId].filter(Boolean).join(".");
}

export function getAllTokens(client: SanityClient): Promise<Token[]> {
  return client.fetch(
    `*[_type == 'crossDatasetToken' && _id in path('secrets.sanity.sharedContent.**')]{_id, _type, _updatedAt, token}`
  );
}

export function fetchTokenDocument(client: SanityClient, id: string) {
  return client.fetch(`*[_id == $id]{_id, _type, _updatedAt, token}[0]`, {
    id: id,
  });
}

export async function deleteToken(
  client: SanityClient,
  id: string
): Promise<unknown> {
  return client.delete(id);
}
export async function saveToken(
  client: SanityClient,
  values: {
    projectId: string;
    dataset: string;
    tokenId?: string;
    token: string;
  }
): Promise<unknown> {
  const id = getTokenDocumentId(values);
  const tr = client
    .transaction()
    .createIfNotExists({ _id: id, _type: "crossDatasetToken" })
    .patch(id, (p) => p.set({ token: values.token }));

  return tr.commit();
}
