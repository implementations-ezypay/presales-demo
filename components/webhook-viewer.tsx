"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, Clipboard, Copy, Database, RefreshCw, Search, Webhook as WebhookIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { JsonHighlighter } from "@/components/json-highlighter"
import { createClient } from "@/lib/supabase/client"

type JsonValue = Record<string, unknown> | unknown[] | string | number | boolean | null

type Webhook = {
  id: string
  webhook_type: string
  payload: JsonValue
  headers: JsonValue
  created_at: string
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(dateString))
}

function fieldCount(value: JsonValue) {
  return value && typeof value === "object" && !Array.isArray(value) ? Object.keys(value).length : 0
}

function JsonPanel({ label, value, onCopy, copied }: { label: string; value: JsonValue; onCopy: () => void; copied: boolean }) {
  return (
    <Card className="overflow-hidden border-border/70 shadow-sm">
      <CardHeader className="flex-row items-center justify-between gap-4 border-b bg-muted/30 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Database className="size-3.5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold">{label}</h3>
            <p className="text-xs text-muted-foreground">{fieldCount(value)} top-level fields</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onCopy} className="shrink-0 gap-2 text-muted-foreground hover:text-foreground">
          {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </CardHeader>
      <CardContent className="overflow-x-auto bg-[#111827] p-0 dark:bg-[#0b1120]">
        <div aria-label={`${label} JSON viewer`} className="min-w-[520px] overflow-x-auto px-5 py-5 font-mono text-[13px] leading-6 text-slate-200">
          <JsonHighlighter data={value && typeof value === "object" ? value : { value }} />
        </div>
      </CardContent>
    </Card>
  )
}

export function WebhookViewer({ initialWebhooks }: { initialWebhooks: Webhook[] }) {
  const [webhooks, setWebhooks] = useState<Webhook[]>(initialWebhooks)
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(initialWebhooks[0] || null)
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState("")
  const supabase = createClient()

  useEffect(() => {
    setWebhookUrl(`${window.location.origin}/api/webhook`)
  }, [])

  useEffect(() => {
    const channel = supabase.channel("webhooks").on("postgres_changes", { event: "INSERT", schema: "public", table: "webhooks" }, (payload) => {
      const newWebhook = payload.new as Webhook
      setWebhooks((prev) => [newWebhook, ...prev])
      setSelectedWebhook(newWebhook)
    }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  const filteredWebhooks = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return webhooks
    return webhooks.filter((webhook) => JSON.stringify(webhook).toLowerCase().includes(query))
  }, [webhooks, searchQuery])

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    window.setTimeout(() => setCopiedId(null), 1800)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    const { data } = await supabase.from("webhooks").select("*").order("created_at", { ascending: false }).limit(100)
    if (data) {
      setWebhooks(data as Webhook[])
      if (data.length > 0) setSelectedWebhook((current) => current || data[0] as Webhook)
    }
    setIsRefreshing(false)
  }

  return (
    <main className="flex min-h-screen flex-col bg-muted/20 text-foreground lg:h-screen lg:flex-row lg:overflow-hidden">
      <aside className="flex w-full shrink-0 flex-col border-b bg-background lg:w-[340px] lg:border-b-0 lg:border-r">
        <header className="border-b px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-primary"><WebhookIcon className="size-4" aria-hidden="true" /><span className="text-xs font-semibold uppercase tracking-[0.18em]">Event console</span></div>
              <h1 className="text-xl font-semibold tracking-tight">Webhook activity</h1>
              <p className="mt-1 text-sm text-muted-foreground">Inspect incoming events in real time.</p>
            </div>
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing} aria-label="Refresh webhooks"><RefreshCw className={isRefreshing ? "animate-spin" : ""} /></Button>
          </div>
          <div className="mt-5 rounded-lg border bg-muted/40 p-3">
            <div className="mb-1 flex items-center justify-between"><span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Endpoint</span><Badge variant="secondary" className="font-mono text-[10px]">POST</Badge></div>
            <div className="flex items-center gap-2"><code className="min-w-0 flex-1 truncate text-xs text-foreground">{webhookUrl || "Loading endpoint..."}</code><Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={() => handleCopy(webhookUrl, "url")} aria-label="Copy webhook endpoint">{copiedId === "url" ? <Check /> : <Clipboard />}</Button></div>
          </div>
          <div className="relative mt-3"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search events..." className="pl-9" /></div>
        </header>
        <div className="flex items-center justify-between px-5 py-3 text-xs text-muted-foreground"><span>Recent deliveries</span><span>{filteredWebhooks.length} of {webhooks.length}</span></div>
        <ScrollArea className="min-h-0 flex-1"><div className="flex flex-col gap-1.5 px-3 pb-4">
          {filteredWebhooks.length === 0 ? <div className="px-2 py-10 text-center text-sm text-muted-foreground">{searchQuery ? "No matching events" : "No webhooks received yet"}</div> : filteredWebhooks.map((webhook) => <button key={webhook.id} onClick={() => setSelectedWebhook(webhook)} className={`rounded-lg border p-3 text-left transition-colors ${selectedWebhook?.id === webhook.id ? "border-primary/30 bg-primary/8 shadow-sm" : "border-transparent hover:border-border hover:bg-muted/60"}`} aria-current={selectedWebhook?.id === webhook.id ? "true" : undefined}><div className="mb-2 flex items-center justify-between gap-2"><Badge variant="outline" className="max-w-[180px] truncate font-mono text-[11px]">{webhook.webhook_type}</Badge><span className="shrink-0 text-[11px] text-muted-foreground">{formatDate(webhook.created_at)}</span></div><p className="truncate font-mono text-[11px] text-muted-foreground">{webhook.id}</p></button>)}
        </div></ScrollArea>
      </aside>
      <section className="min-w-0 flex-1 overflow-y-auto">
        {selectedWebhook ? <div className="mx-auto max-w-5xl p-5 sm:p-8"><div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div className="min-w-0"><div className="mb-3 flex flex-wrap items-center gap-2"><Badge className="font-mono">{selectedWebhook.webhook_type}</Badge><span className="text-xs text-muted-foreground">{formatDate(selectedWebhook.created_at)}</span></div><h2 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">Event details</h2><p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><span className="truncate font-mono">{selectedWebhook.id}</span><Button variant="ghost" size="icon" className="size-6 shrink-0" onClick={() => handleCopy(selectedWebhook.id, "id")} aria-label="Copy event ID">{copiedId === "id" ? <Check /> : <Copy />}</Button></p></div><Button variant="outline" onClick={() => handleCopy(JSON.stringify(selectedWebhook.payload, null, 4), selectedWebhook.id)} className="shrink-0 gap-2"><Copy data-icon="inline-start" />{copiedId === selectedWebhook.id ? "Copied JSON" : "Copy payload"}</Button></div><Separator className="mb-6" /><div className="flex flex-col gap-5"><JsonPanel label="Payload" value={selectedWebhook.payload} onCopy={() => handleCopy(JSON.stringify(selectedWebhook.payload, null, 4), "payload")} copied={copiedId === "payload"} /><JsonPanel label="Request headers" value={selectedWebhook.headers || {}} onCopy={() => handleCopy(JSON.stringify(selectedWebhook.headers || {}, null, 4), "headers")} copied={copiedId === "headers"} /></div></div> : <div className="flex min-h-[60vh] items-center justify-center p-8 text-center"><div><div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><WebhookIcon className="size-5" /></div><h2 className="text-lg font-semibold">No webhook selected</h2><p className="mt-2 max-w-sm text-sm text-muted-foreground">Select an event from the sidebar or send a POST request to your endpoint.</p></div></div>}
      </section>
    </main>
  )
}

export type { Webhook }
