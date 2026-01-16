import { type NextRequest, NextResponse } from "next/server"

export type ApiLog = {
  id: string
  timestamp: string
  method: string
  url: string
  requestBody?: any
  response: any
  status: number
}

// Server-side in-memory log storage
const serverApiLogs: ApiLog[] = []

export async function GET() {
  return NextResponse.json(serverApiLogs)
}

export async function POST(request: NextRequest) {
  try {
    const log: ApiLog = await request.json()
    serverApiLogs.push(log)
    // Keep only last 100 logs in memory
    if (serverApiLogs.length > 100) {
      serverApiLogs.shift()
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to save log" }, { status: 500 })
  }
}

export async function DELETE() {
  serverApiLogs.length = 0
  return NextResponse.json({ success: true })
}
