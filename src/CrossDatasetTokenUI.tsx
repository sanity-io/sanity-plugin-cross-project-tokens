import React, {useCallback, useMemo, useState} from "react"
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Inline,
  Spinner,
  Stack,
  Text,
} from "@sanity/ui"
import {StateLink} from "@sanity/base/router"
import {AddIcon, CloseIcon} from "@sanity/icons"

import {SanityClient} from "@sanity/client"
import {usePromise} from "./utils/usePromise"
import {TokenForm} from "./TokenForm"
import {
  deleteToken,
  fetchTokenDocument,
  getAllTokens,
  getTokenDocumentId,
  saveToken,
} from "./data"

function parseTokenDocumentId(id: string): {
  projectId: string
  dataset: string
  tokenId?: string
} {
  if (!id.startsWith("secrets.sanity.sharedContent")) {
    throw new Error(
      "Unexpected document id. The _id of cross dataset token documents should begin with `secrets.sanity.sharedContent`",
    )
  }
  const [, , , projectId, dataset, tokenId] = id.split(".")
  return {projectId: projectId!, dataset: dataset!, tokenId}
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function validateFormData(formData: Record<string, FormDataEntryValue>):
  | {valid: false; errors: string[]}
  | {
      valid: true
      values: {
        dataset: string
        projectId: string
        tokenId?: string
        token: string
      }
    } {
  const {dataset, projectId, tokenId, token} = formData
  if (
    typeof dataset !== "string" ||
    typeof projectId !== "string" ||
    typeof token !== "string" ||
    typeof tokenId !== "string"
  ) {
    return {valid: false, errors: ["Missing required values"]}
  }
  return {
    valid: true,
    values: {
      dataset,
      projectId,
      token,
      tokenId: tokenId === "" ? undefined : tokenId,
    },
  }
}

interface ToolProps {
  client: SanityClient
  navigate: (nextState: Record<string, unknown>) => void
  notify: (notification: {title: string; status: "success" | "info"}) => void
  params:
    | null
    | {action: "edit"; dataset: string; projectId: string; tokenId?: string}
    | {action: "new"}
}

export function CrossDatasetTokenRoot(props: ToolProps) {
  return (
    <Box padding={2}>
      <CrossDatasetTokenUI {...props} />
    </Box>
  )
}

export function CrossDatasetTokenUI(props: ToolProps) {
  const {client, navigate, notify, params} = props

  const [refreshCount, setRefreshCount] = useState(0)

  const tokenDocumentId = useMemo(() => {
    if (params === null || params.action === "new") {
      return null
    }
    return getTokenDocumentId({
      projectId: params.projectId,
      dataset: params.dataset,
      tokenId: params.tokenId,
    })
  }, [params])

  const loadToken = useCallback(
    (): Promise<null | {
      token: string
      dataset: string
      projectId: string
      tokenId?: string
    }> =>
      tokenDocumentId
        ? fetchTokenDocument(client, tokenDocumentId).then(token => {
            if (!token) {
              return token
            }
            return {
              ...parseTokenDocumentId(token._id),
              token: token.token,
            }
          })
        : Promise.resolve(null),
    [client, tokenDocumentId],
  )
  const tokenDocumentPromise = usePromise(loadToken)

  const allTokensPromise = usePromise(
    useCallback(() => getAllTokens(client), [refreshCount]),
  )
  const [syncState, setSyncState] = useState<null | "saving" | "deleting">(null)

  const handleSave = useCallback(
    async event => {
      event.preventDefault()
      const formInput = validateFormData(
        Object.fromEntries(new FormData(event.target)),
      )
      if (!formInput.valid) {
        // this should really not happen because of native form validation
        return
      }
      setSyncState("saving")
      await saveToken(client, formInput.values)
      await delay(1000)
      setSyncState(null)
      setRefreshCount(c => c + 1)
      navigate({
        action: "edit",
        dataset: formInput.values.dataset,
        projectId: formInput.values.projectId,
        tokenId: formInput.values.tokenId,
      })
      notify({title: "Token saved", status: "success"})
      setSyncState(null)
    },
    [client, navigate, notify],
  )

  const handleDelete = useCallback(
    async (id: string) => {
      // eslint-disable-next-line no-alert
      if (confirm("Are you sure you want to delete this token?")) {
        setSyncState("deleting")
        await deleteToken(client, id)
        await delay(1000)
        setRefreshCount(c => c + 1)
        setSyncState(null)
        navigate({action: ""})
        notify({title: "Token deleted", status: "info"})
      }
    },
    [client, navigate, notify],
  )

  if (allTokensPromise.type === "loading") {
    return <Box padding={2}>Loading…</Box>
  }

  if (allTokensPromise.type === "error") {
    return (
      <Card padding={2} tone="critical">
        Fetch tokens failed: {allTokensPromise.error.message}
      </Card>
    )
  }

  return (
    <Stack>
      <Box paddingX={3} paddingY={4}>
        <Heading as="h1">Cross dataset tokens</Heading>
      </Box>
      <Flex padding={2} gap={2}>
        <Card shadow={2} radius={2} padding={1}>
          <Card padding={2} borderBottom>
            <Flex gap={3} align="center">
              <Box flex={1}>
                <Text weight="semibold">Existing tokens</Text>
              </Box>
              <Button
                as={StateLink}
                // @ts-ignore
                state={{action: "new"}}
                data-as="button"
                padding={3}
                radius={2}
                mode="ghost"
                icon={AddIcon}
                text="Add new"
                style={{textDecoration: "none"}}
              />
            </Flex>
          </Card>
          <Stack space={3} marginY={2}>
            {allTokensPromise.result.map(token => {
              const {dataset, projectId, tokenId} = parseTokenDocumentId(
                token._id,
              )
              return (
                <Card
                  as={StateLink}
                  // @ts-ignore
                  state={{action: "edit", dataset, projectId, tokenId}}
                  data-as="a"
                  selected={tokenDocumentId === token._id}
                  padding={2}
                  marginX={1}
                  radius={2}
                  key={token._id}
                  style={{textDecoration: "none"}}
                >
                  <Stack space={2}>
                    <Text weight="bold">{tokenId || "Dataset default"}</Text>
                    <Inline space={2}>
                      <Text size={1}>ProjectId: {projectId}</Text>
                      <Text size={1}>Dataset: {dataset}</Text>
                    </Inline>
                  </Stack>
                </Card>
              )
            })}
          </Stack>
        </Card>
        {params?.action && (
          <Card flex={1} shadow={2} padding={3} radius={2}>
            <Stack space={4}>
              <Flex align="center">
                <Box flex={1}>
                  <Heading as="h2" size={1}>
                    {params.action === "edit" ? <>Edit</> : <>Add new</>} cross
                    dataset token
                  </Heading>
                </Box>
                <Box>
                  <Button
                    as={StateLink}
                    //@ts-ignore
                    state={{action: ""}}
                    data-as="button"
                    icon={CloseIcon}
                    mode="bleed"
                  />
                </Box>
              </Flex>
              {tokenDocumentPromise.type === "loading" && <Box>Loading…</Box>}
              {tokenDocumentPromise.type === "error" && (
                <Box>Error: {tokenDocumentPromise.error.message}</Box>
              )}
              {params?.action === "edit" &&
                tokenDocumentPromise.type === "ok" &&
                (tokenDocumentPromise.result ? (
                  <form onSubmit={handleSave}>
                    <Stack space={4}>
                      <TokenForm
                        action="edit"
                        token={tokenDocumentPromise.result.token}
                        dataset={tokenDocumentPromise.result.dataset}
                        tokenId={tokenDocumentPromise.result.tokenId}
                        projectId={tokenDocumentPromise.result.projectId}
                      />
                      <Inline space={3}>
                        <Button
                          type="submit"
                          text="Save"
                          tone="primary"
                          disabled={Boolean(syncState)}
                        />
                        <Button
                          text="Delete"
                          type="button"
                          mode="bleed"
                          tone="critical"
                          disabled={Boolean(syncState)}
                          onClick={
                            tokenDocumentId
                              ? () => handleDelete(tokenDocumentId)
                              : undefined
                          }
                        />
                        {syncState && (
                          <Inline space={2}>
                            <Spinner muted />
                            <Text size={1} muted>
                              {syncState === "deleting" ? (
                                <>Deleting…</>
                              ) : (
                                <>Saving…</>
                              )}
                            </Text>
                          </Inline>
                        )}
                      </Inline>
                    </Stack>
                  </form>
                ) : (
                  <Box>Token not found: {tokenDocumentId}</Box>
                ))}
              {params?.action === "new" && (
                <form onSubmit={handleSave}>
                  <Stack space={4}>
                    <TokenForm action="create" />
                    <Inline space={3}>
                      <Button
                        type="submit"
                        text="Add"
                        tone="primary"
                        disabled={Boolean(syncState)}
                      />
                      {syncState && (
                        <Inline space={2}>
                          <Spinner muted />
                          <Text size={1} muted>
                            {syncState === "deleting" ? (
                              <>Deleting…</>
                            ) : (
                              <>Saving…</>
                            )}
                          </Text>
                        </Inline>
                      )}
                    </Inline>
                  </Stack>
                </form>
              )}
            </Stack>
          </Card>
        )}
      </Flex>
    </Stack>
  )
}
