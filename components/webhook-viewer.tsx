"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Copy, Check, RefreshCw } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { JsonHighlighter } from "@/components/json-highlighter"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

type Webhook = {
  id: string
  webhook_type: string
  // The payload can come in any shapes and we dont care as long as is json
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headers: any
  created_at: string
}

export function WebhookViewer({
  initialWebhooks,
}: {
  initialWebhooks: Webhook[]
}) {
  const [webhooks, setWebhooks] = useState<Webhook[]>(initialWebhooks)
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(
    initialWebhooks[0] || null
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  const supabase = createClient()

  // Set webhook URL and mounted state on client side only to avoid hydration mismatch
  useEffect(() => {
    setWebhookUrl(`${window.location.origin}/api/webhook`)
    setIsMounted(true)
  }, [])

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel("webhooks")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "webhooks",
        },
        (payload) => {
          const newWebhook = payload.new as Webhook
          setWebhooks((prev) => [newWebhook, ...prev])
          // Auto-select the new webhook
          setSelectedWebhook(newWebhook)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // Filter webhooks based on search query
  const filteredWebhooks = useMemo(() => {
    if (!searchQuery) return webhooks

    const query = searchQuery.toLowerCase()
    return webhooks.filter((webhook) => {
      const payloadString = JSON.stringify(webhook.payload).toLowerCase()
      const typeString = webhook.webhook_type.toLowerCase()
      return payloadString.includes(query) || typeString.includes(query)
    })
  }, [webhooks, searchQuery])

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    const { data, error } = await supabase
      .from("webhooks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (!error && data) {
      setWebhooks(data)
      if (data.length > 0 && !selectedWebhook) {
        setSelectedWebhook(data[0])
      }
    }
    setIsRefreshing(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date)
  }

  // Don't render until mounted to prevent hydration issues
  if (!isMounted) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Loading webhook viewer...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border flex flex-col bg-muted/30">
        {/* Header */}
        <div className="p-4 border-b border-border bg-background">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold text-foreground">
              Webhook Viewer
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          {/* Webhook URL Display */}
          <Card className="p-3 mb-3 bg-muted">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">
                  Webhook URL:
                </p>
                <p className="text-xs font-mono truncate text-foreground">
                  {webhookUrl}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCopy(webhookUrl, "url")}
                className="h-7 w-7 shrink-0"
              >
                {copiedId === "url" ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </Card>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search webhooks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Webhook List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredWebhooks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {searchQuery
                  ? "No webhooks match your search"
                  : "No webhooks received yet"}
              </div>
            ) : (
              filteredWebhooks.map((webhook) => (
                <button
                  key={webhook.id}
                  onClick={() => setSelectedWebhook(webhook)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedWebhook?.id === webhook.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted border border-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <Badge variant="secondary" className="font-mono text-xs">
                      {webhook.webhook_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDate(webhook.created_at)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedWebhook ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-border bg-background">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-semibold text-foreground">
                      {selectedWebhook.webhook_type}
                    </h2>
                    <Badge variant="outline" className="font-mono text-xs">
                      {selectedWebhook.id}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Received {formatDate(selectedWebhook.created_at)}
                  </p>
                </div>
                <Button
                  onClick={() =>
                    handleCopy(
                      JSON.stringify(selectedWebhook.payload, null, 2),
                      selectedWebhook.id
                    )
                  }
                  variant="outline"
                  size="sm"
                >
                  {copiedId === selectedWebhook.id ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy JSON
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* JSON Display */}
            <ScrollArea className="flex-1 p-6">
              <Accordion
                type="multiple"
                defaultValue={["payload", "headers"]}
                className="space-y-4"
              >
                {/* Payload */}
                <AccordionItem
                  value="payload"
                  className="border border-border rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="text-sm font-medium text-muted-foreground hover:no-underline py-3 px-4 bg-muted/40 hover:bg-muted/60">
                    <div className="flex items-center gap-2">
                      <span>Payload</span>
                      <Badge variant="secondary" className="text-xs">
                        {Object.keys(selectedWebhook.payload).length} fields
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-3 pb-3 px-4 border-t border-border">
                    <div className="bg-black/40 rounded p-4 overflow-hidden">
                      <div className="max-w-full overflow-hidden">
                        <JsonHighlighter data={selectedWebhook.payload} />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Headers */}
                <AccordionItem
                  value="headers"
                  className="border border-border rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="text-sm font-medium text-muted-foreground hover:no-underline py-3 px-4 bg-muted/40 hover:bg-muted/60">
                    <div className="flex items-center gap-2">
                      <span>Headers</span>
                      <Badge variant="secondary" className="text-xs">
                        {Object.keys(selectedWebhook.headers || {}).length}{" "}
                        fields
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-3 pb-3 px-4 border-t border-border">
                    <div className="bg-black/40 rounded p-4 overflow-hidden">
                      <div className="max-w-full overflow-hidden">
                        <JsonHighlighter data={selectedWebhook.headers} />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No webhook selected
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Select a webhook from the sidebar to view its details, or send a
                POST request to the webhook URL above.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
