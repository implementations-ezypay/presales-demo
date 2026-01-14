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

const DB_NAME = "presales-demo"
const STORE_NAME = "apiLogs"
const DB_VERSION = 1

let dbInstance: IDBDatabase | null = null

export async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" })
        store.createIndex("timestamp", "timestamp", { unique: false })
      }
    }
  })
}

export async function saveLogs(logs: ApiLog[]): Promise<void> {
  const db = await initDB()
  const transaction = db.transaction([STORE_NAME], "readwrite")
  const store = transaction.objectStore(STORE_NAME)

  // Clear existing logs
  await new Promise<void>((resolve, reject) => {
    const clearRequest = store.clear()
    clearRequest.onerror = () => reject(clearRequest.error)
    clearRequest.onsuccess = () => resolve()
  })

  // Add all logs
  for (const log of logs) {
    await new Promise<void>((resolve, reject) => {
      const addRequest = store.add(log)
      addRequest.onerror = () => reject(addRequest.error)
      addRequest.onsuccess = () => resolve()
    })
  }
}

export async function getLogs(): Promise<ApiLog[]> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly")
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index("timestamp")
    const request = index.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const logs = request.result as ApiLog[]
      // Sort by timestamp descending (newest first)
      resolve(logs.reverse())
    }
  })
}

export async function clearLogs(): Promise<void> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.clear()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}
