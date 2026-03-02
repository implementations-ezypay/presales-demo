"use client"

import { PaymentMethodIcon } from "@/components/ui/payment-method-icon"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useBranch } from "@/components/utils"
import {
  listOneInvoiceOptions,
  listTransactionOptions,
} from "@/lib/query-options/invoice"
import {
  formatPaymentMethodDisplay,
  getPaymentMethodType,
  parseCurrency,
} from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { CheckCircle, XCircle } from "lucide-react"
import { usePathname } from "next/navigation"

const TableRowSkeleton = () => (
  <TableRow>
    <TableCell>
      <Skeleton className="w-25 h-2" />
    </TableCell>
    <TableCell>
      <Skeleton className="w-15 h-2" />
    </TableCell>
    <TableCell>
      <Skeleton className="w-45 h-2" />
    </TableCell>
    <TableCell>
      <Skeleton className="w-15 h-2" />
    </TableCell>
    <TableCell>
      <Skeleton className="w-15 h-2" />
    </TableCell>
  </TableRow>
)

export default function TransactionTable() {
  const invoiceId = usePathname().split("/")[2]
  const branch = useBranch()

  const { data: invoice, isSuccess: isInvoiceSuccess } = useQuery(
    listOneInvoiceOptions(invoiceId, branch)
  )

  const { data: transactionData, isSuccess: isTransactionSuccess } = useQuery(
    listTransactionOptions(invoice?.id, branch)
  )

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isTransactionSuccess && isInvoiceSuccess ? (
          transactionData?.data.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.createdOn.split("T")[0]}</TableCell>
              <TableCell className="font-medium">
                {parseCurrency(transaction.amount.value)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 max-w-30">
                  <PaymentMethodIcon
                    type={
                      transaction.source !== "external_payment"
                        ? getPaymentMethodType(invoice.paymentMethodData)
                        : ""
                    }
                    className="h-4 w-8"
                  />
                  <span>
                    {transaction.source === "external_payment"
                      ? `External (${transaction.paymentMethodType})`
                      : formatPaymentMethodDisplay(invoice.paymentMethodData)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {transaction.status.toLowerCase() === "success" ||
                  transaction.status.toLowerCase() === "settled" ? (
                    <CheckCircle className="h-4 w-4 text-accent" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                  <span className="capitalize">{transaction.status}</span>
                </div>
              </TableCell>
              <TableCell>
                {transaction.failedPaymentReason && (
                  <span className="text-xs text-destructive">
                    {transaction.failedPaymentReason.code}
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <>
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
          </>
        )}
      </TableBody>
    </Table>
  )
}
