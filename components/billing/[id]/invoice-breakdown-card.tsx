"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { listOneInvoiceOptions } from "@/lib/query-options/invoice"
import { useBranch } from "@/components/utils"
import { DollarSign } from "lucide-react"
import { parseCurrency } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function InvoiceBreakDownCard() {
  const invoiceId = usePathname().split("/")[2]
  const branch = useBranch()

  const { data: invoice, isPending } = useQuery(
    listOneInvoiceOptions(invoiceId, branch)
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base md:text-lg">
          <div className="flex justify-between items-center">
            <p>Invoice Breakdown</p>
            {invoice && (
              <p className="text-muted-foreground">{`Total Amount: ${parseCurrency(invoice.amount.value - invoice.totalRefunded.value)}`}</p>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      {isPending || !invoice ? (
        <div className="flex items-center justify-center py-6">
          <Spinner className="h-6 w-6" />
        </div>
      ) : (
        <ScrollArea>
          <CardContent className="space-y-3 md:space-y-4 max-h-[300px]">
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
          </CardContent>
        </ScrollArea>
      )}
    </Card>
  )
}
