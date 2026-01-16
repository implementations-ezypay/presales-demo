"use client"

export type ApiLog = {
  id: string
  timestamp: string
  method: string
  url: string
  requestBody?: any
  response: any
  status: number
}

const apiLogs: ApiLog[] = []

export function logApiCall(method: string, url: string, response: any, status: number, requestBody?: any) {
  const log: ApiLog = {
    id: `${Date.now()}-${Math.random()}`,
    timestamp: new Date().toISOString(),
    method,
    url,
    requestBody,
    response,
    status,
  }
  apiLogs.push(log)
  // Keep only last 100 logs in memory
  if (apiLogs.length > 100) {
    apiLogs.shift()
  }
}

export function getApiLogs(): ApiLog[] {
  return apiLogs
}

export function getApiLogFromLocal() {
  // No-op: logs are now stored in memory only
}

export function clearApiLogs() {
  apiLogs.length = 0
}
