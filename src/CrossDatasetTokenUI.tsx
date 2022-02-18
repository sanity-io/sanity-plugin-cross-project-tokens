import React, {useCallback, useRef, useState} from "react"
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
  ToastParams,
} from "@sanity/ui"
import {StateLink} from "@sanity/base/router"
import {AddIcon, CloseIcon, PlayIcon} from "@sanity/icons"

import {SanityClient} from "@sanity/client"
import {usePromise} from "./utils/usePromise"
import {TokenForm} from "./TokenForm"
import {
  deleteToken,
  fetchTokenDocument,
  getAllTokens,
  saveToken,
  TokenDocumentAttributes,
} from "./data"
import {fromDocumentId, parse, stringify, toDocumentId} from "./utils/TokenId"

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

interface FormValues extends TokenDocumentAttributes {
  projectId: string
  tokenId?: string
}

function validateFormData(formData: Record<string, FormDataEntryValue>):
  | {valid: false; errors: string[]}
  | {
      valid: true
      values: FormValues
    } {
  const {projectId, tokenId, token, displayName, comment} = formData
  if (
    typeof projectId !== "string" ||
    typeof token !== "string" ||
    typeof tokenId !== "string"
  ) {
    return {valid: false, errors: ["Missing required values"]}
  }
  return {
    valid: true,
    values: {
      projectId,
      token,
      displayName: displayName as string,
      comment: comment as string,
      tokenId: tokenId === "" ? undefined : tokenId,
    },
  }
}

interface ToolProps {
  client: SanityClient
  navigate: (
    nextState:
      | {action: "edit"; tokenId: string}
      | {action: "new"}
      | {action: ""},
  ) => void
  notify: (notification: ToastParams) => void
  params: null | {action: "edit"; tokenId: string} | {action: "new"}
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
  const formRef = useRef<HTMLFormElement | null>(null)

  const token = params?.action === "edit" ? parse(params.tokenId) : null

  const tokenDocumentId = token ? toDocumentId(token) : null

  const loadTokenDocument = useCallback(
    () =>
      tokenDocumentId
        ? fetchTokenDocument(client, tokenDocumentId)
        : Promise.resolve(null),
    [client, tokenDocumentId],
  )

  const tokenDocumentPromise = usePromise(loadTokenDocument)

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
      const {projectId, tokenId, ...attributes} = formInput.values
      await saveToken(client, toDocumentId({projectId, tokenId}), attributes)
      await delay(1000)
      setSyncState(null)
      setRefreshCount(c => c + 1)
      notify({title: "Token saved", status: "success"})
      setSyncState(null)
      navigate({
        action: "edit",
        tokenId: stringify({
          projectId: formInput.values.projectId,
          tokenId: formInput.values.tokenId,
        }),
      })
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
        notify({title: "Token deleted", status: "info"})
        navigate({action: ""})
      }
    },
    [client, navigate, notify],
  )

  const handleValidate = useCallback(async () => {
    if (!formRef.current) {
      throw new Error("Missing formRef")
    }
    const formValues = Object.fromEntries(new FormData(formRef.current))
    const {projectId, token} = formValues

    if (!projectId || typeof projectId !== "string") {
      alert("No projectId given")
      return
    }
    if (!token || typeof token !== "string") {
      alert("No token given")
      return
    }
    notify({
      id: "token-validation",
      title: "Validating token…",
      status: "info",
    })

    // assumption: it doesn't really matter what project api you request with the `sanity-project-tokens`
    // it will be validated no matter what
    client
      .request({
        url: `/datasets`,
        method: "HEAD",
        headers: {"sanity-project-tokens": `${projectId}=${token}`},
      })
      .then(
        res => {
          notify({
            id: "token-validation",
            title: "Token is valid!",
            status: "success",
          })
        },
        err => {
          notify({
            id: "token-validation",
            title: "Token is invalid!",
            closable: true,
            duration: 100000,
            description: (
              <>
                You can generate a new token for project {projectId} at{" "}
                <a href="https://www.sanity.io/manage">
                  https://www.sanity.io/manage
                </a>
              </>
            ),
            status: "error",
          })
        },
      )
  }, [client, navigate, notify])

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
            {allTokensPromise.type === "loading" && (
              <Box padding={2}>
                <Text muted>Loading…</Text>
              </Box>
            )}
            {allTokensPromise.type === "error" && (
              <Card padding={2} tone="critical">
                <Text>
                  Fetch tokens failed: {allTokensPromise.error.message}
                </Text>
              </Card>
            )}

            {allTokensPromise.type === "ok" &&
              allTokensPromise.result.map(tokenDocument => {
                const token = fromDocumentId(tokenDocument._id)
                return (
                  <Card
                    as={StateLink}
                    // @ts-ignore
                    state={{action: "edit", tokenId: stringify(token)}}
                    data-as="a"
                    selected={tokenDocumentId === tokenDocument._id}
                    padding={2}
                    marginX={1}
                    radius={2}
                    key={tokenDocument._id}
                    style={{textDecoration: "none"}}
                  >
                    <Stack space={2}>
                      <Text weight="bold">
                        {tokenDocument.displayName || (
                          <>Token for {token.projectId}</>
                        )}
                      </Text>
                      <Inline space={2}>
                        <Text size={1}>ProjectId: {token.projectId}</Text>
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
              {tokenDocumentPromise.type === "loading" && (
                <Box>
                  <Text muted>Loading…</Text>
                </Box>
              )}
              {tokenDocumentPromise.type === "error" && (
                <Box>
                  <Text>Error: {tokenDocumentPromise.error.message}</Text>
                </Box>
              )}
              {params?.action === "edit" &&
                token &&
                tokenDocumentPromise.type === "ok" &&
                (tokenDocumentPromise.result ? (
                  <form onSubmit={handleSave} ref={formRef}>
                    <Stack space={4}>
                      <TokenForm
                        action="edit"
                        token={token}
                        tokenDocument={tokenDocumentPromise.result}
                      />
                      <Flex>
                        <Inline flex={1} space={3}>
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

                        <Button
                          type="button"
                          mode="ghost"
                          text="Validate token"
                          icon={PlayIcon}
                          onClick={handleValidate}
                        />
                      </Flex>
                    </Stack>
                  </form>
                ) : (
                  <Box>Token not found: {tokenDocumentId}</Box>
                ))}
              {params?.action === "new" && (
                <form onSubmit={handleSave} ref={formRef}>
                  <Stack space={4}>
                    <TokenForm action="create" />
                    <Inline space={3}>
                      <Button
                        type="submit"
                        text="Add"
                        tone="primary"
                        disabled={Boolean(syncState)}
                      />
                      <Button
                        type="button"
                        mode="ghost"
                        text="Validate token"
                        icon={PlayIcon}
                        onClick={handleValidate}
                      />
                      {syncState && (
                        <Inline space={2}>
                          <Spinner muted />
                          <Text size={1} muted>
                            Creating…
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
