"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useBranch } from "@/components/utils"
import { listOneInvoiceOptions } from "@/lib/query-options/invoice"
import { parseCurrency } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { DollarSign } from "lucide-react"
import { usePathname } from "next/navigation"

const BreakdownItemSkeleton = () => (
  <div className="flex items-center gap-3">
    <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
    <div className="min-w-0 w-full">
      <Skeleton className="h-4 w-48 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  </div>
)

export default function InvoiceBreakDownCard() {
  const invoiceId = usePathname().split("/")[2]
  const branch = useBranch()

  const { data: invoice, isSuccess } = useQuery(
    listOneInvoiceOptions(invoiceId, branch)
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base md:text-lg">
          <div className="flex justify-between items-center">
            <p>Invoice Breakdown</p>
            {isSuccess && invoice ? (
              <p className="text-muted-foreground">{`Total Amount: ${parseCurrency(invoice.amount.value - invoice.totalRefunded.value)}`}</p>
            ) : (
              <Skeleton className="h-4 w-40" />
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <ScrollArea>
        <CardContent className="space-y-3 md:space-y-4 max-h-[300px]">
          {isSuccess && invoice ? (
            <>
              {invoice.items.toReversed().map((item) => (
                <div className="flex items-center gap-3" key={item.id}>
                  <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p
                      className={`${item.type?.match(/fee/i) ? "font-medium" : "font-bold"}`}
                    >
                      {item.description}
                    </p>
                    <p
                      className={`${item.type?.match(/fee/i) ? "text-muted-foreground" : "text-foreground font-bold"}`}
                    >
                      {parseCurrency(item.amount.value)}
                    </p>
                  </div>
                </div>
              ))}
              {invoice.totalRefunded.value !== 0 && (
                <div className="flex items-center gap-3  bg-primary/10 border border-primary/50 rounded-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className=" font-medium">Total Refunded</p>
                    <p className=" text-muted-foreground truncate">
                      {parseCurrency(invoice.totalRefunded.value)}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <BreakdownItemSkeleton />
              <BreakdownItemSkeleton />
              <BreakdownItemSkeleton />
            </>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  )
}
