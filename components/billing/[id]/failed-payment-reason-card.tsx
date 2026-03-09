"use client"

import { StatusBadge } from "@/components/shared/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useBranch } from "@/components/utils"
import { listOneInvoiceOptions } from "@/lib/query-options/invoice"
import { useQuery } from "@tanstack/react-query"
import { CircleX } from "lucide-react"
import { usePathname } from "next/navigation"

export default function FailedPaymentReasonCard() {
  const invoiceId = usePathname().split("/")[2]
  const branch = useBranch()

  const { data: invoice, isSuccess } = useQuery(
    listOneInvoiceOptions(invoiceId, branch)
  )

  return (
    <Card
      className={
        invoice?.failedPaymentReason
          ? "border border-orange-500/50 bg-orange-50 dark:bg-orange-950/20"
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
      {isSuccess && invoice ? (
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
      ) : (
        <CardContent className="space-y-3 md:space-y-4">
          <div className="flex items-left gap-6">
            <Skeleton className="h-4 w-4  rounded-full" />
            <div className="min-w-0 w-full">
              <Skeleton className="h-4 w-48 my-2" />
              <Skeleton className="h-2 w-64 my-2" />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
