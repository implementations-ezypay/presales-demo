"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { listOneInvoiceOptions } from "@/lib/query-options/invoice"
import { useBranch } from "@/components/utils"
import { Braces, Calendar, PersonStanding } from "lucide-react"
import { formatPaymentMethodDisplay, getPaymentMethodType } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"
import { PaymentMethodIcon } from "@/components/ui/payment-method-icon"
import { listSingleCustomerOptions } from "@/lib/query-options/customer"

export default function InvoiceDetailsCard() {
  const invoiceId = usePathname().split("/")[2]
  const branch = useBranch()

  const { data: invoice, isPending } = useQuery(
    listOneInvoiceOptions(invoiceId, branch)
  )

  const { data: customer } = useQuery(
    listSingleCustomerOptions(invoice?.customerId || null, branch)
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base md:text-lg">
          <div className="flex justify-between items-center">
            <p>Invoice Details</p>
            {invoice?.paymentMethodData && (
              <div className="flex flex-row gap-6 items-center">
                <PaymentMethodIcon
                  type={getPaymentMethodType(invoice?.paymentMethodData)}
                ></PaymentMethodIcon>
                <p className="text-sm text-muted-foreground">
                  {formatPaymentMethodDisplay(invoice?.paymentMethodData)}
                </p>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      {isPending || !invoice ? (
        <div className="flex items-center justify-center py-6">
          <Spinner className="h-6 w-6" />
        </div>
      ) : (
        <CardContent className="space-y-3 md:space-y-4">
          <div className="flex items-center gap-3">
            <Braces className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-medium">Invoice ID</p>
              <p className=" text-muted-foreground truncate">{invoice.id}</p>
            </div>
          </div>
          <div className="grid gap-4 md:gap-6 lg:grid-cols-2 ">
            <div className="flex items-center gap-3">
              <PersonStanding className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium">Member</p>
                <p className=" text-muted-foreground truncate">{`${invoice.customerFirstName || customer?.firstName} ${invoice.customerLastName || customer?.lastName}`}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className=" font-medium">Invoice Date</p>
                <p className=" text-muted-foreground">{invoice.dueDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className=" font-medium">Schedule Date</p>
                <p className=" text-muted-foreground">
                  {invoice.scheduledPaymentDate || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
