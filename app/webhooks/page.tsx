import { WebhookViewer } from "@/components/webhook-viewer"
import { createClient } from "@/lib/supabase/server"

export default async function Home() {
  const supabase = await createClient()

  // Fetch initial webhooks
  const { data: webhooks, error } = await supabase
    .from("webhooks")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    console.error("[v0] Failed to fetch webhooks:", error)
  }

  return <WebhookViewer initialWebhooks={webhooks || []} />
}
