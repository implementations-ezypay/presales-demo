"use client"

import { PaymentMethodSelection } from "@/components/shared/payment-method-selection"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  listInvoiceOptions,
  listOneInvoiceOptions,
  listSingleInvoiceOptions,
  listTransactionOptions,
  retryInvoiceOptions,
} from "@/lib/query-options/invoice"
import { DialogTrigger } from "@radix-ui/react-dialog"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { RefreshCw } from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { useBranch } from "../../utils"

export function RetryDialog() {
  const [selectedMethodId, setSelectedMethodId] = useState("")
  const [open, setOpenChange] = useState(false)
  const invoiceId = usePathname().split("/")[2]
  const branch = useBranch()
  const queryClient = useQueryClient()

  const { data: invoice } = useQuery(listOneInvoiceOptions(invoiceId, branch))

  useEffect(() => setSelectedMethodId(invoice?.paymentMethodToken), [invoice])

  const retryInvoiceMutation = useMutation({
    ...retryInvoiceOptions(branch),
    onSuccess: async (data) => {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      queryClient.invalidateQueries(listInvoiceOptions(branch))
      queryClient.invalidateQueries(
        listSingleInvoiceOptions(data.customerId, branch)
      )
      queryClient.invalidateQueries(listTransactionOptions(invoiceId, branch))
      queryClient.invalidateQueries(listOneInvoiceOptions(invoiceId, branch))
      setOpenChange(false)
    },
    onError: (error) => {
      console.log(error)
    },
  })

  const handleRefund = async () => {
    if (!invoice) return

    if (invoiceId)
      retryInvoiceMutation.mutate({
        invoiceId,
        paymentMethodToken: selectedMethodId,
      })
  }

  return (
    <Dialog open={open} onOpenChange={setOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary" disabled={retryInvoiceMutation.isPending}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {retryInvoiceMutation.isPending ? "Retrying..." : "Retry"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Retry Invoice</DialogTitle>
          <DialogDescription>
            Retry on the invoice immediately. Should not trigger more than once
            per day
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="refundAmount">
              Select Payment Method for Retry
            </Label>
            <PaymentMethodSelection
              customerId={invoice.customerId}
              selectedMethodId={selectedMethodId}
              onMethodSelect={setSelectedMethodId}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpenChange(false)}
            disabled={retryInvoiceMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRefund}
            disabled={retryInvoiceMutation.isPending}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {retryInvoiceMutation.isPending ? "Retrying..." : "Confirm Retry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
