"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Mail } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { getEzypayToken } from "@/lib/ezypay-token"
import Link from "next/link"
import { logApiCall } from "@/lib/api-logger"
import { Button } from "@/components/ui/button"
import { getBranchCountry } from "@/lib/branches"
import { linkPaymentMethod } from "@/lib/passer-functions"

interface AddPaymentMethodDialogProps {
  customerId: string
  onSuccess?: () => void
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  customerEmail?: string
  customerName?: string
}

export function AddPaymentMethodDialog({
  customerId,
  onSuccess,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  customerName,
}: AddPaymentMethodDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const iframeOriginRef = useRef<string | null>(null)
  const [branch, setBranch] = useState("")
  const [country, setCountry] = useState("")

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const setOpen = (newOpen: boolean) => {
    if (isControlled) {
      controlledOnOpenChange?.(newOpen)
    } else {
      setInternalOpen(newOpen)
      controlledOnOpenChange?.(newOpen)
    }
  }

  useEffect(() => {
    if (open && !iframeUrl) {
      loadIframeUrl()
    }
  }, [open])

  useEffect(() => {
    const selectedBranch = localStorage.getItem("selectedBranch") || "main"
    setBranch(selectedBranch)
    setCountry(getBranchCountry(selectedBranch))
  }, [])

  useEffect(() => {
    const handleMessage = async (e: MessageEvent) => {
      // Handle payment method added successfully
      let listenerResponse = e.data
      if (typeof listenerResponse === "string") {
        listenerResponse = JSON.parse(listenerResponse)
      }

      if (listenerResponse.type === "success") {
        console.log(
          "Success message detected, linking token to customer",
          listenerResponse,
        )
      }
      if (!listenerResponse.data) return
      const { paymentMethodToken } = listenerResponse.data
      console.log(paymentMethodToken, country, customerId)

      if (country === "PH" && paymentMethodToken) {
        try {
          const res = await linkPaymentMethod(
            customerId,
            paymentMethodToken,
            branch,
          )
          await new Promise((resolve) => setTimeout(resolve, 2000))
          setOpen(false)
        } catch (error) {
          console.error(error)
        }
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [country, branch, customerId])

  const loadIframeUrl = async () => {
    setIsLoading(true)
    try {
      const tokenRes = await getEzypayToken(branch)
      const token = tokenRes.access_token

      if (!token) {
        throw new Error(`Token endpoint failed`)
      }

      const pcpUrl =
        country === "PH"
          ? `${process.env.NEXT_PUBLIC_HPP_ENDPOINT}/paymentmethod/embed?token=${token}&countryCode=${country}`
          : `${process.env.NEXT_PUBLIC_PCP_ENDPOINT}/paymentmethod/embed?token=${token}&feepricing=true&submitbutton=true&customerId=${customerId}`
      setIframeUrl(pcpUrl)
      await logApiCall(
        "GET",
        pcpUrl.replace(/token=[^&]*&/i, `token={truncated}&`),
        "Payment Capture Page UI",
        200,
      )

      try {
        const url = new URL(pcpUrl)
        iframeOriginRef.current = url.origin
      } catch (e) {
        iframeOriginRef.current = null
      }
    } catch (error) {
      console.error("[v0] Error loading iframe URL:", error)
      toast.error("Failed to load payment form")
      setOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailCustomer = () => {
    const emailPreviewLink = `${window.location.origin}/email-preview?id=${customerId}&name=${customerName}`

    window.open(emailPreviewLink, "_blank")
    toast.success("Email draft opened in new tab")
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setIframeUrl(null)
      onSuccess?.()
    }
  }

  const submitHpp = (e, type) => {
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
        setIsLoading(false)
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

  const content = (
    <DialogContent className="min-w-[50vw] h-[90vh]">
      <DialogHeader className="p-2 pb-0">
        <DialogTitle>Add Payment Method</DialogTitle>
        <DialogDescription>
          Add a new payment method for automatic billing
        </DialogDescription>
        <DialogDescription className="italic">
          Host&nbsp;
          <Link
            href={"https://developer.ezypay.com/docs/payment-capture-page#/"}
            target="_blank"
            className="underline"
          >
            Ezypay's Payment capture page
          </Link>
          &nbsp;here and allow customer to update their payment method. This
          should be on the customer portal if available.
        </DialogDescription>
      </DialogHeader>
      <div className="flex-1 p-4 mt-10">
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        ) : iframeUrl ? (
          <iframe
            ref={iframeRef}
            src={iframeUrl}
            className="h-full w-full rounded-lg border border-border p-4"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Failed to load payment form
          </div>
        )}
      </div>
      {/* Moved email button to dialog footer */}
      <DialogFooter>
        {country === "PH" && (
          <Button
            variant="outline"
            onClick={(e) => submitHpp(e, "create")}
            className="gap-2 bg-transparent"
          >
            Submit
          </Button>
        )}
        <Button
          variant="outline"
          onClick={handleEmailCustomer}
          className="gap-2 bg-transparent"
        >
          <Mail className="h-4 w-4" />
          Email Customer
        </Button>
      </DialogFooter>
    </DialogContent>
  )

  if (children) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        {content}
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {content}
    </Dialog>
  )
}
