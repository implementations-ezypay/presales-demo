"use client"

import JsonView from "react18-json-view"
import "react18-json-view/src/style.css"
import "react18-json-view/src/dark.css"
import "@/components/json-highlighter.css"

type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[]

/**
 * Thin wrapper around react18-json-view so the rest of the app can keep
 * importing `JsonHighlighter` without depending on the underlying library
 * directly. Uses a 4-space indent and renders every node expanded by
 * default, while still allowing individual nodes to be collapsed.
 */
export function JsonHighlighter({ data }: { data: JsonValue }) {
  return (
    <JsonView
      src={data}
      dark
      collapsed={false}
      displaySize={false}
      enableClipboard={false}
      className="json-highlighter"
    />
  )
}
