"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentMethodIcon } from "@/components/ui/payment-method-icon"
import { Skeleton } from "@/components/ui/skeleton"
import { useBranch } from "@/components/utils"
import { listSingleCustomerOptions } from "@/lib/query-options/customer"
import { listOneInvoiceOptions } from "@/lib/query-options/invoice"
import { formatPaymentMethodDisplay, getPaymentMethodType } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { Braces, Calendar, PersonStanding } from "lucide-react"
import { usePathname } from "next/navigation"

export default function InvoiceDetailsCard() {
  const invoiceId = usePathname().split("/")[2]
  const branch = useBranch()

  const { data: invoice, isSuccess } = useQuery(
    listOneInvoiceOptions(invoiceId, branch)
  )

  const { data: customer, isSuccess: isCustomerSuccess } = useQuery(
    listSingleCustomerOptions(invoice?.customerId || null, branch)
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base md:text-lg">
          <div className="flex justify-between items-center">
            <p>Invoice Details</p>
            <div className="flex flex-row gap-6 items-center">
              {isSuccess ? (
                <>
                  <PaymentMethodIcon
                    type={getPaymentMethodType(invoice?.paymentMethodData)}
                  ></PaymentMethodIcon>
                  <p className="text-sm text-muted-foreground">
                    {formatPaymentMethodDisplay(invoice?.paymentMethodData)}
                  </p>
                </>
              ) : (
                <Skeleton className="h-2 w-40" />
              )}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4">
        <div className="flex items-center gap-3">
          <Braces className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-medium">Invoice ID</p>
            {isSuccess ? (
              <p className=" text-muted-foreground truncate">{invoice.id}</p>
            ) : (
              <Skeleton className="w-70 h-2 my-2" />
            )}
          </div>
        </div>
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2 ">
          <div className="flex items-center gap-3">
            <PersonStanding className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-medium">Member</p>
              {isSuccess && isCustomerSuccess ? (
                <p className="text-muted-foreground truncate">{`${invoice.customerFirstName || customer?.firstName} ${invoice.customerLastName || customer?.lastName}`}</p>
              ) : (
                <Skeleton className="w-30 h-2 my-2" />
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className=" font-medium">Invoice Date</p>
              {isSuccess ? (
                <p className=" text-muted-foreground">{invoice.dueDate}</p>
              ) : (
                <Skeleton className="w-30 h-2 my-2" />
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className=" font-medium">Schedule Date</p>
              {isSuccess ? (
                <p className=" text-muted-foreground">
                  {invoice.scheduledPaymentDate || "N/A"}
                </p>
              ) : (
                <Skeleton className="w-30 h-2 my-2" />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
