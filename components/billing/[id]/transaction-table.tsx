"use client"

import { usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import {
  listOneInvoiceOptions,
  listTransactionOptions,
} from "@/lib/query-options/invoice"
import { useBranch } from "@/components/utils"
import { CheckCircle, XCircle } from "lucide-react"
import {
  formatPaymentMethodDisplay,
  getPaymentMethodType,
  parseCurrency,
} from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"
import { PaymentMethodIcon } from "@/components/ui/payment-method-icon"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function TransactionTable() {
  const invoiceId = usePathname().split("/")[2]
  const branch = useBranch()

  const { data: invoice } = useQuery(listOneInvoiceOptions(invoiceId, branch))

  const { data: transactionData, isPending: isTransactionPending } = useQuery(
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
        {isTransactionPending ? (
          <TableRow>
            <TableCell colSpan={7} className="pt-2 text-center">
              <div className="flex items-center justify-center">
                <Spinner className="h-6 w-6 mr-2" />
                <span>Loading History...</span>
              </div>
            </TableCell>
          </TableRow>
        ) : (
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
        )}
      </TableBody>
    </Table>
  )
}
