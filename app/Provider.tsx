"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export default function Provider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [queryClient] = useState(() => new QueryClient())

  if (typeof window !== "undefined")
    window.__TANSTACK_QUERY_CLIENT__ = queryClient

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
