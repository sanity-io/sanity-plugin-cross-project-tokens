import {Stack, Text, TextArea, TextInput} from "@sanity/ui"
import React from "react"
import {Token} from "./utils/TokenId"
import {TokenDocument} from "./data"

const VALID_ID_PART = "[a-zA-Z0-9]+"

interface Props {
  action: "edit" | "create"
  token?: Token
  tokenDocument?: TokenDocument
}

export function TokenForm(props: Props) {
  const {action, token, tokenDocument} = props
  return (
    <Stack flex={1} space={4}>
      <Stack space={2}>
        <Stack space={2}>
          <Text size={2}>Project ID</Text>
          <Text size={1} muted>
            The ID of the project that this token has access to. Must match{" "}
            {VALID_ID_PART}. Must be the ID of a valid project and match{" "}
            {VALID_ID_PART} if provided.
          </Text>
        </Stack>
        <TextInput
          name="projectId"
          type="text"
          readOnly={action === "edit"}
          required
          pattern={VALID_ID_PART}
          autoComplete="off"
          defaultValue={token?.projectId}
        />
      </Stack>
      <Stack space={2}>
        <Stack space={2}>
          <Stack space={2}>
            <Text size={2}>Token</Text>
            <Text size={1} muted>
              Generate a new token at{" "}
              <a href="http://www.sanity.io/manage">
                http://www.sanity.io/manage
              </a>
            </Text>
          </Stack>
          <TextArea
            name="token"
            type="text"
            rows={3}
            required
            pattern=".+"
            autoComplete="off"
            defaultValue={tokenDocument?.token}
          />
        </Stack>
      </Stack>
      <Stack space={2}>
        <Stack space={2}>
          <Text size={2}>Token ID</Text>
          <Text size={1} muted>
            An optional identifier to assign to this token. Leave empty to use
            this token as the default token to use when communicating with the
            datasets within the specified project ID. Must match {VALID_ID_PART}{" "}
            if provided.
          </Text>
        </Stack>
        <TextInput
          name="tokenId"
          type="text"
          readOnly={action === "edit"}
          pattern={VALID_ID_PART}
          autoComplete="off"
          defaultValue={token?.tokenId}
        />
      </Stack>
      <Stack space={2}>
        <Stack space={2}>
          <Text size={2}>Display name</Text>
          <Text size={1} muted>
            Optional, but you can give it a display name so it's easy to
            remember
          </Text>
        </Stack>
        <TextInput
          name="displayName"
          type="text"
          autoComplete="off"
          defaultValue={tokenDocument?.displayName}
        />
      </Stack>
      <Stack space={2}>
        <Stack space={2}>
          <Text size={2}>Comment</Text>
          {/*<Text size={1} muted>Optional comment</Text>*/}
        </Stack>
        <TextArea
          name="comment"
          type="text"
          autoComplete="off"
          defaultValue={tokenDocument?.comment}
        />
      </Stack>
    </Stack>
  )
}
