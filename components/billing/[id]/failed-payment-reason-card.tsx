"use client"

import { StatusBadge } from "@/components/shared/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useBranch } from "@/components/utils"
import { listOneInvoiceOptions } from "@/lib/query-options/invoice"
import { useQuery } from "@tanstack/react-query"
import { CircleX } from "lucide-react"
import { usePathname } from "next/navigation"

export default function FailedPaymentReasonCard() {
  const invoiceId = usePathname().split("/")[2]
  const branch = useBranch()

  const { data: invoice, isPending } = useQuery(
    listOneInvoiceOptions(invoiceId, branch)
  )

  return (
    <Card
      className={
        invoice?.failedPaymentReason
          ? "border border-orange-500/50 bg-orange-50 dark:bg-orange-950/20 p-4"
          : ""
      }
    >
      <CardHeader>
        <CardTitle className="text-base md:text-lg">
          <div className="flex justify-between items-center">
            <p>Failed Payment Reason</p>
          </div>
        </CardTitle>
      </CardHeader>
      {isPending || !invoice ? (
        <div className="flex items-center justify-center py-6">
          <Spinner className="h-6 w-6" />
        </div>
      ) : (
        (invoice.failedPaymentReason && (
          <CardContent className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-6">
              <CircleX className="h-4 w-4 flex-shrink-0 text-destructive" />
              <div className="min-w-0">
                <p className=" font-medium">
                  {invoice.failedPaymentReason?.code}
                </p>
                <p className=" text-muted-foreground">
                  {invoice.failedPaymentReason?.description}
                </p>
              </div>
            </div>
          </CardContent>
        )) ||
        (!invoice.failedPaymentReason && (
          <CardContent className="space-y-3 md:space-y-4">
            <div className="flex items-left gap-6 flex-col">
              <p>Failed Payment Reason Not Available</p>
              <div className="gap-3 flex flex-row items-center">
                <p>{`Invoice Status is: `}</p>
                <StatusBadge status={invoice.status} />
              </div>
            </div>
          </CardContent>
        ))
      )}
    </Card>
  )
}
