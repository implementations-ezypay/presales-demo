"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useBranch } from "@/components/utils"
import { logApiCall } from "@/lib/api-logger"
import { getBranchCountry } from "@/lib/branches"
import {
  getTokenOptions,
  linkPaymentMethodOptions,
} from "@/lib/query-options/payment-method"
import { useMutation } from "@tanstack/react-query"
import { ArrowBigRight, Mail } from "lucide-react"
import Link from "next/link"
import { MouseEvent, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

const pcpEndpoint = process.env.NEXT_PUBLIC_PCP_ENDPOINT
const hppEndpoint = process.env.NEXT_PUBLIC_HPP_ENDPOINT

type PaymentCapturePageProps = {
  emailPreviewLink: string
  customerId: string
}

export default function PaymentCapturePage({
  emailPreviewLink,
  customerId,
}: PaymentCapturePageProps) {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const [country, setCountry] = useState("")
  const branch = useBranch()

  // Track selected values from Select components separately for easier UI updates
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const iframeOriginRef = useRef<string | null>(null)

  useEffect(() => {
    setCountry(getBranchCountry(branch))

    const handleMessage = async (e: MessageEvent) => {
      // Handle payment method added successfully
      let listenerResponse = e.data
      if (typeof listenerResponse === "string") {
        listenerResponse = JSON.parse(listenerResponse)
      }

      if (e.data && listenerResponse.type === "success") {
        console.log("Success message detected, redirecting to /members", e.data)
      }

      if (country === "PH" && e.data.paymentMethodToken) {
        const { customerId, paymentMethodToken } = e.data
        linkPaymentMethodMutation.mutate({ paymentMethodToken, customerId })
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [branch])

  const getTokenMutation = useMutation({
    ...getTokenOptions(branch),
    onSuccess: (data, input) => {
      const token = data.access_token
      const { customerId } = input
      const pcpUrl =
        country === "PH"
          ? `${hppEndpoint}/paymentmethod/embed?token=${token}&countryCode=${country}`
          : `${pcpEndpoint}/paymentmethod/embed?token=${token}&feepricing=true&submitbutton=true${
              customerId ? "&customerId=" + customerId : ""
            }`
      setIframeUrl(pcpUrl)
      logApiCall(
        "GET",
        pcpUrl.replace(/token=[^&]*&/i, `token={truncated}&`),
        "Payment capture page UI",
        200
      )
      try {
        // Record origin from the iframe URL so we can validate messages
        const url = new URL(pcpUrl)
        iframeOriginRef.current = url.origin
      } catch (_e) {
        iframeOriginRef.current = null
      }
    },
    onError: () => {
      toast.error(
        "Error in getting Ezypay token. Unable to generate the payment capture page."
      )
    },
  })

  const linkPaymentMethodMutation = useMutation({
    ...linkPaymentMethodOptions(branch),
  })

  useEffect(() => {
    if (customerId && branch) getTokenMutation.mutate({ customerId })
  }, [customerId, branch])

  const submitHpp = (e: MouseEvent, type: string) => {
    e.preventDefault()
    if (!iframeRef.current) {
      toast.error("Payment form not loaded")
      return
    }
    try {
      const iframeWindow = iframeRef.current.contentWindow

      if (!iframeWindow) {
        console.error("[postMessage] iframe window not accessible")
        toast.error("Payment form not ready")
        return
      }

      const targetOrigin = iframeOriginRef.current || "*"
      console.log("[postMessage] Sending message", {
        actionType: type,
        targetOrigin,
        iframeOrigin: iframeOriginRef.current,
        currentUrl: window.location.href,
      })

      // Send the message to the iframe
      iframeWindow.postMessage({ actionType: type }, targetOrigin)
      console.log("[postMessage] Message sent successfully")
    } catch (error) {
      console.error("[submitHpp] Error sending postMessage:", error)
      toast.error("Failed to submit payment form")
    }
  }

  const handleEmailCustomer = () => {
    window.open(emailPreviewLink, "_blank")
    toast.success("Email draft opened in new tab")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base md:text-lg">
          Payment Information
        </CardTitle>
        <CardDescription className="text-sm">
          Add payment method for recurring billing
        </CardDescription>

        <div className="grid grid-cols-2">
          <Button
            variant="outline"
            onClick={handleEmailCustomer}
            className="gap-2 bg-transparent"
          >
            <Mail className="h-4 w-4" />
            Email Customer
          </Button>
          <Button
            variant="outline"
            className="gap-2 bg-transparent"
            type="button"
            asChild
          >
            <Link href={`/members/${customerId}`}>
              <ArrowBigRight className="h-4 w-4" />
              Go to Customer Profile
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {getTokenMutation.isPending ? (
          <div className="flex h-[500px] items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        ) : iframeUrl ? (
          <iframe
            ref={iframeRef}
            src={iframeUrl}
            className="h-[70vh] w-full rounded-lg border border-border"
            title="Add Payment Method"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        ) : (
          <div className="flex h-[500px] items-center justify-center text-muted-foreground">
            Failed to load payment form
          </div>
        )}
      </CardContent>
      {country === "PH" && (
        <Button
          variant="outline"
          onClick={(e) => submitHpp(e, "create")}
          className="gap-2 bg-transparent"
        >
          Submit
        </Button>
      )}
    </Card>
  )
}
