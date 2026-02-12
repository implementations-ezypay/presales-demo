export type ApiLog = {
  id: string
  timestamp: string
  method: string
  url: string
  requestBody?: any
  response: any
  status: number
}

export async function logApiCall(
  method: string,
  url: string,
  response: any,
  status: number,
  requestBody?: any,
) {
  const log: ApiLog = {
    id: `${Date.now()}-${Math.random()}`,
    timestamp: new Date().toISOString(),
    method,
    url,
    requestBody,
    response,
    status,
  }

  // Send to server-side storage
  try {
    const baseUrl =
      typeof window !== "undefined"
        ? window.origin
        : process.env.NEXTAUTH_URL ||
          `http://localhost:${process.env.PORT || 3000}`

    await fetch(`${baseUrl}/api/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(log),
    })
  } catch (error) {
    console.error("Failed to save log to server:", error)
  }
}

export async function getApiLogs(): Promise<ApiLog[]> {
  try {
    const response = await fetch("/api/logs")
    if (response.ok) {
      return await response.json()
    }
    return []
  } catch (error) {
    console.error("Failed to fetch logs from server:", error)
    return []
  }
}

export async function clearApiLogs(): Promise<void> {
  try {
    await fetch("/api/logs", { method: "DELETE" })
  } catch (error) {
    console.error("Failed to clear logs on server:", error)
  }
}

// Keep for backwards compatibility
export function getApiLogFromLocal() {
  // No-op: logs are now fetched from server
}
