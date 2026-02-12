import { type NextRequest, NextResponse } from "next/server"
import { getItem, setItem, clearStore } from "@/lib/json-store"

export type ApiLog = {
  id: string
  timestamp: string
  method: string
  url: string
  requestBody?: any
  response: any
  status: number
}

const LOGS_STORAGE_KEY = "api_logs"
const MAX_LOGS = 100
const isProduction = process.env.NODE_ENV === "production"

// In-memory cache for production (session-scoped)
let prodLogsCache: ApiLog[] = []

async function getProdLogs(): Promise<ApiLog[]> {
  // In production, use in-memory session storage
  return prodLogsCache
}

async function setProdLogs(logs: ApiLog[]): Promise<void> {
  prodLogsCache = logs
}

async function getDevLogs(): Promise<ApiLog[]> {
  // In development, use persistent file storage
  try {
    const data = await getItem(LOGS_STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

async function setDevLogs(logs: ApiLog[]): Promise<void> {
  // In development, persist to file storage
  try {
    await setItem(LOGS_STORAGE_KEY, JSON.stringify(logs))
  } catch (error) {
    console.error("Failed to save logs to persistent storage:", error)
  }
}

export async function GET() {
  const logs = isProduction ? await getProdLogs() : await getDevLogs()
  return NextResponse.json(logs)
}

export async function POST(request: NextRequest) {
  try {
    const log: ApiLog = await request.json()
    console.log("[v0] POST /api/logs - Received log:", log.id, log.method, log.url)
    const logs = isProduction ? await getProdLogs() : await getDevLogs()
    
    logs.push(log)
    
    // Keep only last 100 logs
    if (logs.length > MAX_LOGS) {
      logs.shift()
    }
    
    isProduction ? await setProdLogs(logs) : await setDevLogs(logs)
    console.log("[v0] POST /api/logs - Stored successfully. Total logs:", logs.length)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Failed to save log:", error)
    return NextResponse.json({ error: "Failed to save log" }, { status: 500 })
  }
}

export async function DELETE() {
  if (isProduction) {
    await setProdLogs([])
  } else {
    await clearStore()
  }
  return NextResponse.json({ success: true })
}
