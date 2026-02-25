"use client"

import FailedPaymentReasonCard from "@/components/billing/[id]/failed-payment-reason-card"
import InvoiceBreakDownCard from "@/components/billing/[id]/invoice-breakdown-card"
import InvoiceDetailsCard from "@/components/billing/[id]/invoice-details-card"
import { RefundDialog } from "@/components/billing/[id]/refund-dialog"
import { RetryDialog } from "@/components/billing/[id]/retry-dialog"
import { TrackExternalPaymentDialog } from "@/components/billing/[id]/track-external-payment-dialog"
import TransactionTable from "@/components/billing/[id]/transaction-table"
import { WriteOffDialog } from "@/components/billing/[id]/write-off-dialog"
import { StatusBadge } from "@/components/shared/status-badge"
import { TopBar } from "@/components/top-bar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBranch } from "@/components/utils"
import { listOneInvoiceOptions } from "@/lib/query-options/invoice"
import { formatPaymentMethodDisplay } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { MailIcon, RefreshCw } from "lucide-react"
import { usePathname } from "next/navigation"

export default function BillingDetailsPage() {
  const invoiceId = usePathname().split("/")[2]
  const branch = useBranch()

  const {
    data: invoice,
    isPending,
    isError,
  } = useQuery(listOneInvoiceOptions(invoiceId, branch))

  const handlePayNow = async () => {
    if (!invoice?.payNowUrl) {
      return
    }

    try {
      if (typeof invoice?.payNowUrl !== "string") throw new Error("Invalid URL")
      // validate URL

      new URL(invoice?.payNowUrl)

      if (typeof window !== "undefined") {
        window.open(invoice?.payNowUrl, "_blank", "noopener,noreferrer")
      }
    } catch (err) {
      console.error("[v0] Failed to open Pay Now URL", err, invoice?.payNowUrl)
    }
  }

  const handleEmail = async () => {
    if (!invoice) return
    try {
      const emailPreviewLink = `${window.location.origin}/email-preview?id=${
        invoice?.customerId ?? null
      }&name=${invoice?.customerFirstName} ${invoice?.customerLastName}&paymentMethod=${formatPaymentMethodDisplay(
        invoice?.paymentMethodData
      )}&paymentMethodInvalid=${invoice?.paymentMethodInvalid}&reason=${
        invoice?.failedPaymentReason?.code +
        ": " +
        invoice?.paymentProviderResponse?.description
      }`
      window.open(emailPreviewLink, "_blank")
    } catch (err) {
      console.error("[v0] Failed to open email URL", err, invoice?.payNowUrl)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="space-y-4 md:space-y-6">
          {/* Page Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center-safe min-h-15">
            {/* Invoice Title */}
            <div className="flex gap-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-balance">
                  {isPending || isError ? (
                    <Skeleton className="w-72 h-3 bg-foreground mb-3"></Skeleton>
                  ) : (
                    invoice?.documentNumber
                  )}
                </h1>
                <p className=" md:text-base text-muted-foreground">
                  Managing your invoice
                </p>
              </div>
              <div className="items-center flex justify-center">
                {isPending || isError ? (
                  <Skeleton className="w-15 h-3 bg-foreground"></Skeleton>
                ) : (
                  <StatusBadge
                    status={invoice.status}
                    className="text-lg px-4"
                  />
                )}
              </div>
            </div>
            {/* Invoice Actions */}
            <div>
              {(invoice?.status.toLowerCase() === "failed" ||
                invoice?.status.toLowerCase() === "past_due" ||
                invoice?.status.toLowerCase() === "unpaid") && (
                <>
                  <RetryDialog />

                  {invoice?.payNowUrl && (
                    <Button variant="secondary" onClick={handlePayNow}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Pay Now
                    </Button>
                  )}

                  {invoice?.paymentMethodInvalid && (
                    <Button variant="secondary" onClick={handleEmail}>
                      <MailIcon className="mr-2 h-4 w-4" />
                      Email Customer
                    </Button>
                  )}

                  <TrackExternalPaymentDialog />

                  <WriteOffDialog />
                </>
              )}

              {invoice?.status.toLowerCase().match(/^paid|^partial/i) && (
                <RefundDialog />
              )}
            </div>
          </div>

          {/* Invoices Card */}
          <div className="grid gap-4 md:gap-6 lg:grid-cols-3 min-h-[300px] ">
            <InvoiceDetailsCard />

            <InvoiceBreakDownCard />

            <FailedPaymentReasonCard />
          </div>

          {/* Transaction List */}
          <Tabs defaultValue="invoices" className="space-y-4">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="invoices" className="flex-shrink-0">
                Transactions
              </TabsTrigger>
            </TabsList>
            <TabsContent value="invoices">
              <TransactionTable />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
