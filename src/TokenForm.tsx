import {Inline, Stack, Text, TextInput} from "@sanity/ui"
import React from "react"

const VALID_ID_PART = "[a-zA-Z0-9]+"

type Props = {
  action: "edit" | "create"
  token?: string
  dataset?: string
  projectId?: string
  tokenId?: string
}

export function TokenForm({action, token, dataset, projectId, tokenId}: Props) {
  return (
    <Stack flex={1} space={4}>
      <Stack space={2}>
        <Inline space={2}>
          <Text size={2}>Project ID</Text>
          <Text size={1} muted>
            must match {VALID_ID_PART}
          </Text>
        </Inline>
        <TextInput
          name="projectId"
          type="text"
          readOnly={action === "edit"}
          required
          pattern={VALID_ID_PART}
          autoComplete="off"
          defaultValue={projectId}
        />
      </Stack>
      <Stack space={2}>
        <Inline space={2}>
          <Text size={2}>Dataset</Text>
          <Text size={1} muted>
            must match {VALID_ID_PART}
          </Text>
        </Inline>
        <TextInput
          name="dataset"
          type="text"
          readOnly={action === "edit"}
          required
          pattern={VALID_ID_PART}
          autoComplete="off"
          defaultValue={dataset}
        />
      </Stack>
      <Stack space={2}>
        <Inline space={2}>
          <Text size={2}>Token Id</Text>
          <Text size={1} muted>
            Optional. If not provided this token will be the dataset default.
            Must match {VALID_ID_PART} if provided
          </Text>
        </Inline>
        <TextInput
          name="tokenId"
          type="text"
          readOnly={action === "edit"}
          pattern={VALID_ID_PART}
          autoComplete="off"
          defaultValue={tokenId}
        />
      </Stack>
      <Stack space={2}>
        <Stack space={2}>
          <Inline space={2}>
            <Text size={2}>Token value</Text>
            <Text size={1} muted>
              Generate a new token at{" "}
              <a href="http://www.sanity.io/manage">
                http://www.sanity.io/manage
              </a>
            </Text>
          </Inline>

          <TextInput
            name="token"
            type="text"
            required
            pattern=".+"
            autoComplete="off"
            defaultValue={token}
          />
        </Stack>
      </Stack>
    </Stack>
  )
}
