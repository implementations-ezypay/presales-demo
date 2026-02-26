"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign } from "lucide-react"
import {
  listInvoiceOptions,
  listOneInvoiceOptions,
  listSingleInvoiceOptions,
  listTransactionOptions,
  refundInvoiceOptions,
} from "@/lib/query-options/invoice"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useBranch } from "../../utils"
import { usePathname } from "next/navigation"
import { parseCurrency } from "@/lib/utils"

export function RefundDialog() {
  const [refundAmount, setRefundAmount] = useState("")
  const [open, setOpen] = useState(false)
  const invoiceId = usePathname().split("/")[2]
  const branch = useBranch()
  const queryClient = useQueryClient()

  const {
    data: invoice,
    isPending,
    isError,
  } = useQuery(listOneInvoiceOptions(invoiceId, branch))

  const refundInvoiceMutation = useMutation({
    ...refundInvoiceOptions(branch),
    onSuccess: async (data) => {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      queryClient.invalidateQueries(listInvoiceOptions(branch))
      queryClient.invalidateQueries(
        listSingleInvoiceOptions(data.customerId, branch)
      )
      queryClient.invalidateQueries(listTransactionOptions(invoiceId, branch))
      queryClient.invalidateQueries(listOneInvoiceOptions(invoiceId, branch))
      setOpen(false)
    },
    onError: (error) => {
      console.log(error)
    },
  })

  const handleRefund = async () => {
    if (!invoice) return
    const amount =
      refundAmount.trim() === "" ? null : Number.parseFloat(refundAmount)

    if (
      amount !== null &&
      (isNaN(amount) || amount <= 0 || amount > invoice?.amount.value)
    ) {
      return
    }

    if (invoiceId)
      refundInvoiceMutation.mutate({
        invoiceId,
        amount,
      })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          disabled={refundInvoiceMutation.isPending}
        >
          {refundInvoiceMutation.isPending ? "Refunding..." : "Refund"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Refund Invoice</DialogTitle>
          <DialogDescription>
            Enter a refund amount for partial refund, or leave empty for full
            refund.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-8 lg:py-4">
          <div className="space-y-2">
            <Label htmlFor="refundAmount">Refund Amount (Optional)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="refundAmount"
                type="number"
                placeholder={`${parseCurrency(invoice?.amount.value - invoice?.totalRefunded.value)} (Full refund)`}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="pl-9"
                step="0.01"
                min="0"
                max={invoice?.amount.value}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Invoice amount: {parseCurrency(invoice?.amount.value || 0)}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-3">
            <p className="text-sm font-medium">
              {refundAmount.trim() === "" ||
              Number.parseFloat(refundAmount) === invoice?.amount.value
                ? "Full Refund"
                : "Partial Refund"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Amount to refund:&nbsp;
              {refundAmount.trim() === ""
                ? parseCurrency(
                    invoice?.amount.value - invoice?.totalRefunded.value
                  )
                : parseCurrency(refundAmount)}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={refundInvoiceMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRefund}
            disabled={refundInvoiceMutation.isPending}
          >
            {refundInvoiceMutation.isPending
              ? "Processing..."
              : "Confirm Refund"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
