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
import { Pen, RefreshCw } from "lucide-react"
import {
  listInvoiceOptions,
  listOneInvoiceOptions,
  listSingleInvoiceOptions,
  listTransactionOptions,
  writeOffInvoiceOptions,
} from "@/lib/query-options/invoice"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useBranch } from "../../utils"
import { usePathname } from "next/navigation"
import { DialogTrigger } from "@radix-ui/react-dialog"
import { toast } from "sonner"

export function WriteOffDialog() {
  const [open, setOpen] = useState(false)
  const invoiceId = usePathname().split("/")[2]
  const branch = useBranch()
  const queryClient = useQueryClient()

  const writeOffInvoiceMutation = useMutation({
    ...writeOffInvoiceOptions(branch),
    onSuccess: (data) => {
      toast.success("Invoice written off successfully", { duration: 30000 })
      queryClient.invalidateQueries(listInvoiceOptions(branch))
      queryClient.invalidateQueries(
        listSingleInvoiceOptions(data.customerId, branch)
      )
      queryClient.invalidateQueries(listTransactionOptions(invoiceId, branch))
      queryClient.invalidateQueries(listOneInvoiceOptions(invoiceId, branch))
      setOpen(false)
    },
    onError: (error) => {
      toast.error(
        `Failed to write off invoice: ${error instanceof Error ? error.message : "Unknown error"}`,
        { duration: 30000 }
      )
      console.error("[v0] Write-off error:", error)
    },
  })

  const handleWriteOff = async () => {
    if (!invoiceId) return

    writeOffInvoiceMutation.mutate({
      invoiceId,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          disabled={writeOffInvoiceMutation.isPending}
        >
          <Pen className="mr-2 h-4 w-4" />
          {writeOffInvoiceMutation.isPending ? "Writing Off..." : "Write Off"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="mb-12">
          <DialogTitle>Write Off Invoice</DialogTitle>
          <DialogDescription>
            For failed invoice that are bad debt, write it off to ensure
            accuracy of the invoice status.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={writeOffInvoiceMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleWriteOff}
            disabled={writeOffInvoiceMutation.isPending}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {writeOffInvoiceMutation.isPending ? "Writing Off..." : "Write Off"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
