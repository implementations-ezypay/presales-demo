import { createClient } from "@supabase/supabase-js"

export type ApiLog = {
  id: string
  timestamp: string
  method: string
  url: string
  requestBody?: any
  response: any
  status: number
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error("Missing Supabase credentials")
  }

  return createClient(url, key)
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

  try {
    const client = getSupabaseClient()
    
    // Insert the new log
    const { error: insertError } = await client
      .from("api_logs")
      .insert([{
        id: log.id,
        timestamp: log.timestamp,
        method: log.method,
        url: log.url,
        request_body: log.requestBody,
        response: log.response,
        status: log.status,
      }])

    if (insertError) {
      console.error("[v0] Failed to insert log:", insertError)
      return
    }

    // Clean up old logs - keep only 100 most recent
    const { data: logs, error: fetchError } = await client
      .from("api_logs")
      .select("id, created_at")
      .order("created_at", { ascending: false })

    if (fetchError) {
      console.error("[v0] Failed to fetch logs for cleanup:", fetchError)
      return
    }

    if (logs && logs.length > 100) {
      const logsToDelete = logs.slice(100).map(log => log.id)
      const { error: deleteError } = await client
        .from("api_logs")
        .delete()
        .in("id", logsToDelete)

      if (deleteError) {
        console.error("[v0] Failed to delete old logs:", deleteError)
      }
    }

    console.log("[v0] API call logged successfully:", log.id)
  } catch (error) {
    console.error("[v0] Failed to save log to Supabase:", error)
  }
}

export async function getApiLogs(): Promise<ApiLog[]> {
  try {
    const client = getSupabaseClient()
    
    const { data, error } = await client
      .from("api_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      console.error("[v0] Failed to fetch logs from Supabase:", error)
      return []
    }

    return (data || []).map((log: any) => ({
      id: log.id,
      timestamp: log.timestamp,
      method: log.method,
      url: log.url,
      requestBody: log.request_body,
      response: log.response,
      status: log.status,
    }))
  } catch (error) {
    console.error("[v0] Failed to fetch logs:", error)
    return []
  }
}

export async function clearApiLogs(): Promise<void> {
  try {
    const client = getSupabaseClient()
    
    const { error } = await client
      .from("api_logs")
      .delete()
      .neq("id", "")

    if (error) {
      console.error("[v0] Failed to clear logs from Supabase:", error)
    } else {
      console.log("[v0] All API logs cleared successfully")
    }
  } catch (error) {
    console.error("[v0] Failed to clear logs:", error)
  }
}
