"use server"

import { headers } from "next/headers"

export type ApiLog = {
  id: string
  timestamp: string
  method: string
  url: string
  requestBody?: any
  response: any
  status: number
}

async function getOriginFromHeaders() {
  const h = await headers()
  const proto = h.get("x-forwarded-proto") ?? "https"
  const host = h.get("host")
  if (!host) throw new Error("Missing host header")
  return `${proto}://${host}`
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

  // Send to server-side storage (always use relative URL for client-side)
  try {
    const baseUrl = await getOriginFromHeaders()
    console.log("Trying to create a new log to: ", baseUrl)

    await fetch(`${baseUrl}/api/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(log),
    })
  } catch (error) {
    console.error("[v0] Failed to save log to server:", error)
  }
}

export async function getApiLogs(): Promise<ApiLog[]> {
  try {
    const baseUrl = await getOriginFromHeaders()

    const response = await fetch(`${baseUrl}/api/logs`)
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
    const baseUrl = await getOriginFromHeaders()
    await fetch(`${baseUrl}/api/logs`, { method: "DELETE" })
  } catch (error) {
    console.error("Failed to clear logs on server:", error)
  }
}
