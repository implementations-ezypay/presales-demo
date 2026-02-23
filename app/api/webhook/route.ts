import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the request body
    const body = await request.json()

    // Get headers
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })

    // Extract webhook type from body or default to 'unknown'
    const webhookType =
      body.type || body.event || body.event_type || body.eventType || "unknown"
    console.log(body)

    // Insert into database
    const { data, error } = await supabase
      .from("webhooks")
      .insert({
        webhook_type: webhookType,
        payload: body,
        headers: headers,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Database error:", error)
      return NextResponse.json(
        { error: "Failed to store webhook", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, id: data.id }, { status: 200 })
  } catch (error) {
    console.error("[v0] Webhook processing error:", error)
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    )
  }
}

// Support other HTTP methods
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { message: "Webhook endpoint is active. Send POST requests here." },
    { status: 200 }
  )
}

export async function PUT(request: NextRequest) {
  return POST(request)
}

export async function PATCH(request: NextRequest) {
  return POST(request)
}

export async function DELETE(request: NextRequest) {
  return POST(request)
}
