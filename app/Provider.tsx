"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createContext, useEffect, useState } from "react"

export const BranchContext = createContext<string>("main")

export default function Provider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [queryClient] = useState(() => new QueryClient())
  const [branch, setBranch] = useState<string>("main")

  if (typeof window !== "undefined" && process.env.NODE_ENV !== "production")
    // @ts-expect-error: for non prod debugging
    window.__TANSTACK_QUERY_CLIENT__ = queryClient

  useEffect(() => {
    const selectedBranch = localStorage.getItem("selectedBranch") || "main"
    localStorage.setItem("selectedBranch", selectedBranch)
    setBranch(selectedBranch)
  }, [])

  return (
    <BranchContext.Provider value={branch}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BranchContext.Provider>
  )
}
