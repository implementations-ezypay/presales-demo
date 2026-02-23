type JsonValue = string | number | boolean | null | JsonObject | JsonArray
type JsonObject = { [key: string]: JsonValue }
type JsonArray = JsonValue[]

export function JsonHighlighter({ data }: { data: JsonValue }) {
  const renderValue = (value: JsonValue, depth = 0) => {
    const indent = "  ".repeat(depth)
    const nextIndent = "  ".repeat(depth + 1)

    if (value === null) {
      return <span className="text-purple-400">null</span>
    }

    if (typeof value === "boolean") {
      return <span className="text-purple-400">{value.toString()}</span>
    }

    if (typeof value === "number") {
      return <span className="text-blue-400">{value}</span>
    }

    if (typeof value === "string") {
      return <span className="text-green-600">"{value}"</span>
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-foreground">[]</span>
      }

      return (
        <>
          <span className="text-foreground">[</span>
          {"\n"}
          {value.map((item, index) => (
            <span key={index}>
              {nextIndent}
              {renderValue(item, depth + 1)}
              {index < value.length - 1 ? (
                <span className="text-foreground">,</span>
              ) : (
                ""
              )}
              {"\n"}
            </span>
          ))}
          {indent}
          <span className="text-foreground">]</span>
        </>
      )
    }

    if (typeof value === "object") {
      const entries = Object.entries(value)

      if (entries.length === 0) {
        return <span className="text-foreground">{"{}"}</span>
      }

      return (
        <>
          <span className="text-foreground">{"{"}</span>
          {"\n"}
          {entries.map(([key, val], index) => (
            <span key={key}>
              {nextIndent}
              <span className="text-cyan-500">"{key}"</span>
              <span className="text-foreground">: </span>
              {renderValue(val, depth + 1)}
              {index < entries.length - 1 ? (
                <span className="text-foreground">,</span>
              ) : (
                ""
              )}
              {"\n"}
            </span>
          ))}
          {indent}
          <span className="text-foreground">{"}"}</span>
        </>
      )
    }

    return <span className="text-foreground">{String(value)}</span>
  }

  return (
    <pre className="text-sm font-mono whitespace-pre-wrap break-all max-w-full overflow-hidden">
      {renderValue(data)}
    </pre>
  )
}
