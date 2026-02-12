"use client"

import { useEffect } from "react"
import { clearApiLogs } from "@/lib/api-logger"

export function SessionCleanup() {
  useEffect(() => {
    // Clear logs when page is unloading (session end)
    const handleBeforeUnload = async () => {
      try {
        await clearApiLogs()
      } catch (error) {
        console.error("Failed to clear logs on session end:", error)
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  return null
}
