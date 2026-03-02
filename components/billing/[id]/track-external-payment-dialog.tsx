"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RefreshCw } from "lucide-react"
import {
  listInvoiceOptions,
  listOneInvoiceOptions,
  listSingleInvoiceOptions,
  listTransactionOptions,
  recordExternalInvoiceOptions,
} from "@/lib/query-options/invoice"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useBranch } from "../../utils"
import { usePathname } from "next/navigation"
import { DialogTrigger } from "@radix-ui/react-dialog"
import { Select } from "@radix-ui/react-select"
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select"
import { toast } from "sonner"

export function TrackExternalPaymentDialog() {
  const [externalPaymentMethod, setExternalPaymentMethod] = useState<string>("")
  const [open, setOpenChange] = useState(false)
  const invoiceId = usePathname().split("/")[2]
  const branch = useBranch()
  const queryClient = useQueryClient()

  const { data: invoice } = useQuery(listOneInvoiceOptions(invoiceId, branch))

  const recordExternalInvoiceMutation = useMutation({
    ...recordExternalInvoiceOptions(branch),
    onSuccess: (data) => {
      toast.success("External payment recorded successfully", {
        duration: 30000,
      })
      queryClient.invalidateQueries(listInvoiceOptions(branch))
      queryClient.invalidateQueries(
        listSingleInvoiceOptions(data.customerId, branch)
      )
      queryClient.invalidateQueries(listTransactionOptions(invoiceId, branch))
      queryClient.invalidateQueries(listOneInvoiceOptions(invoiceId, branch))
      setOpenChange(false)
    },
    onError: (error) => {
      toast.error(
        `Failed to record external payment: ${error instanceof Error ? error.message : "Unknown error"}`,
        { duration: 30000 }
      )
      console.error("[v0] External payment error:", error)
    },
  })

  const handleTrackExternalPayment = async () => {
    if (!invoice) return

    if (invoiceId)
      recordExternalInvoiceMutation.mutate({
        invoiceId,
        method: externalPaymentMethod,
      })
  }

  return (
    <Dialog open={open} onOpenChange={setOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          disabled={recordExternalInvoiceMutation.isPending}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {recordExternalInvoiceMutation.isPending
            ? "Recording..."
            : "External Payment"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>External Payment</DialogTitle>
          <DialogDescription>
            Sync with Ezypay system for collection that happens over the counter
            / outside of the system
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-8">
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <Select
            value={externalPaymentMethod}
            onValueChange={setExternalPaymentMethod}
          >
            <SelectTrigger id="paymentMethod">
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="others">Others</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpenChange(false)}
            disabled={recordExternalInvoiceMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleTrackExternalPayment}
            disabled={recordExternalInvoiceMutation.isPending}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {recordExternalInvoiceMutation.isPending
              ? "Recording..."
              : "Record"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
