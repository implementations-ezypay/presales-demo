"use client"

import { useState } from "react"
import { Check, Inbox, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query"
import {
  approveTransferRequestOptions,
  listTransferRequestsOptions,
  rejectTransferRequestOptions,
} from "@/lib/query-options/transfer-customer"
import { listCustomerOptions } from "@/lib/query-options/customer"
import { TransferCustomer } from "@/lib/types/transfer-customer"
import { Customer } from "@/lib/types/customer"
import { getBranchCurrency, getBranchName } from "@/lib/branches"
import { useBranch } from "@/components/utils"
import { useErrorToast } from "@/lib/utils"
import { toast } from "sonner"

const STATUS_VARIANT: Record<
  TransferCustomer["status"],
  "secondary" | "default" | "destructive"
> = {
  requested: "secondary",
  approved: "default",
  rejected: "destructive",
}

export function TransferApprovalDialog() {
  const [open, setOpen] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const branch = useBranch()
  const queryClient = useQueryClient()

  // Requests recorded against this branch as the source branch.
  const { data: requests = [] }: UseQueryResult<TransferCustomer[]> = useQuery(
    listTransferRequestsOptions(branch || null)
  )

  // Customers in this (source) branch, used to resolve name + email by Ezypay number.
  const { data: customersData }: UseQueryResult<{ data: Customer[] }> = useQuery(
    listCustomerOptions(branch || null)
  )

  const findCustomer = (ezypayReferenceNumber: string) =>
    customersData?.data.find((c) => c.number === ezypayReferenceNumber)

  const pendingCount = requests.filter((r) => r.status === "requested").length

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["listTransferRequests", branch],
    })

  const approveMutation = useMutation({
    ...approveTransferRequestOptions(),
    onSuccess: () => {
      invalidate()
      toast.success("Transfer approved and customer moved successfully")
    },
    onError: (error) => {
      useErrorToast("Failed to approve transfer", error)
      console.error("[v0] Approve transfer error:", error)
    },
    onSettled: () => setProcessingId(null),
  })

  const rejectMutation = useMutation({
    ...rejectTransferRequestOptions(),
    onSuccess: () => {
      invalidate()
      toast.success("Transfer request rejected")
    },
    onError: (error) => {
      useErrorToast("Failed to reject transfer", error)
      console.error("[v0] Reject transfer error:", error)
    },
    onSettled: () => setProcessingId(null),
  })

  const isProcessing = approveMutation.isPending || rejectMutation.isPending

  // Only action the specific request whose button was clicked.
  const handleApprove = (request: TransferCustomer) => {
    setProcessingId(request.id)
    approveMutation.mutate(request)
  }

  const handleReject = (id: string) => {
    setProcessingId(id)
    rejectMutation.mutate(id)
  }

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value))

  const formatAmount = (amount: number | null | undefined) => {
    if (amount == null) return "—"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: getBranchCurrency(branch),
    }).format(amount)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative w-full sm:w-auto">
          <Inbox className="mr-2 h-4 w-4" />
          Transfer Approvals
          {pendingCount > 0 && (
            <Badge className="ml-2 h-5 min-w-5 justify-center px-1.5">
              {pendingCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Customer Transfer Approvals</DialogTitle>
          <DialogDescription>
            Requests to transfer customers out of{" "}
            <span className="font-medium">
              {getBranchName(branch) ?? "this branch"}
            </span>
            . Approve to move the customer to the requesting branch, or reject to
            decline.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[420px] pr-3">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <Inbox className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No transfer requests for this branch yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">
                        {getBranchName(request.branchRequestor) ??
                          request.branchRequestor}{" "}
                        <span className="font-normal text-muted-foreground">
                          requested this transfer
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ezypay ref: {request.ezypayReferenceNumber}
                      </p>
                    </div>
                    <Badge
                      variant={STATUS_VARIANT[request.status]}
                      className="capitalize"
                    >
                      {request.status}
                    </Badge>
                  </div>

                  <Separator className="my-3" />

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Amount remaining
                      </p>
                      <p>{formatAmount(request.amountRemaining)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Transfer payment methods
                      </p>
                      <p>{request.transferPaymentMethods ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Requested</p>
                      <p>{formatDate(request.createdAt)}</p>
                    </div>
                  </div>

                  {request.status === "requested" && (
                    <div className="mt-4 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isProcessing}
                        onClick={() => handleReject(request.id)}
                      >
                        <X className="mr-1.5 h-4 w-4" />
                        {processingId === request.id &&
                        rejectMutation.isPending
                          ? "Rejecting..."
                          : "Reject"}
                      </Button>
                      <Button
                        size="sm"
                        disabled={isProcessing}
                        onClick={() => handleApprove(request)}
                      >
                        <Check className="mr-1.5 h-4 w-4" />
                        {processingId === request.id &&
                        approveMutation.isPending
                          ? "Approving..."
                          : "Approve"}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
