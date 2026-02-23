"use client"
import { Search } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex h-screen bg-background items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
