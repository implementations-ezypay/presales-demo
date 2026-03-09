"use client"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, Trash2 } from "lucide-react"
import { MouseEvent, useState } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PaymentMethodIcon } from "@/components/ui/payment-method-icon"
import {
  deletePaymentMethodOptions,
  getCustomerPaymentMethodsOptions,
  replacePaymentMethodOptions,
  updatePayToStatusOptions,
} from "@/lib/query-options/payment-method"
import { PaymentMethod } from "@/lib/types/payment-method"
import {
  formatPaymentMethodDisplay,
  getPaymentMethodType,
  useErrorToast,
} from "@/lib/utils"
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query"
import { Spinner } from "../../ui/spinner"
import { useBranch } from "../../utils"

export function PaymentMethodsList({ customerId }: { customerId: string }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [methodToDelete, setMethodToDelete] = useState<PaymentMethod | null>(
    null
  )
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false)
  const [methodToReplace, setMethodToReplace] = useState<PaymentMethod | null>(
    null
  )
  const branch = useBranch()
  const [activatePayToDialogOpen, setActivatePayToDialogOpen] = useState(false)
  const [methodToActivate, setMethodToActivate] =
    useState<PaymentMethod | null>(null)
  const queryClient = useQueryClient()

  const {
    data,
    isSuccess,
    isError,
    error,
  }: UseQueryResult<{ data: PaymentMethod[] }> = useQuery(
    getCustomerPaymentMethodsOptions(customerId, branch)
  )

  if (isError) {
    useErrorToast("Failed to get customer payment methods", error)
  }

  const replacePaymentMethodMutation = useMutation({
    ...replacePaymentMethodOptions(customerId, branch),
    onSuccess: () => {
      toast.success("Payment method replaced successfully")
      queryClient.invalidateQueries(
        getCustomerPaymentMethodsOptions(customerId, branch)
      )
      setReplaceDialogOpen(false)
    },
    onError: (error) => {
      useErrorToast("Failed to replace customer payment methods", error)
    },
  })

  const deletePaymentMethodMutation = useMutation({
    ...deletePaymentMethodOptions(customerId, branch),
    onSuccess: () => {
      toast.success("Payment method deleted successfully")
      queryClient.invalidateQueries(
        getCustomerPaymentMethodsOptions(customerId, branch)
      )
      setDeleteDialogOpen(false)
    },
    onError: (error) => {
      useErrorToast("Failed to delete payment method", error)
    },
  })

  const updatePayToStatusMutation = useMutation({
    ...updatePayToStatusOptions(branch),
    onSuccess: () => {
      toast.success("Pay-to status updated successfully")
      queryClient.invalidateQueries(
        getCustomerPaymentMethodsOptions(customerId, branch)
      )
      setActivatePayToDialogOpen(false)
    },
    onError: (error) => {
      useErrorToast(`Failed to update pay-to status`, error)
    },
  })

  const PaymentMethodItemSkeleton = () => (
    <div className="flex items-center justify-between rounded-lg border border-border p-2">
      <div className="flex items-center gap-2">
        <div className="min-w-16 flex items-center justify-center">
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-32 mt-1.5" />
          <Skeleton className="h-2 w-40 mb-1.5" />
        </div>
      </div>
    </div>
  )

  if (!isSuccess) {
    return (
      <div className="min-h-9 overflow-auto space-y-2">
        <PaymentMethodItemSkeleton />
        <PaymentMethodItemSkeleton />
      </div>
    )
  }

  if (data?.data?.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        No payment methods found
      </div>
    )
  }

  const customerPaymentMethods = data?.data.sort((a, b) => {
    if (a.primary && !b.primary) return -1
    if (!a.primary && b.primary) return 1
    if (a.valid && !b.valid) return -1
    if (!a.valid && b.valid) return 1
    return 0
  })

  const handleDeleteClick = (method: PaymentMethod, e: MouseEvent) => {
    e.stopPropagation()
    setMethodToDelete(method)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async (e: MouseEvent) => {
    e.preventDefault()
    if (!methodToDelete) return

    deletePaymentMethodMutation.mutate({
      paymentMethodToken: methodToDelete.paymentMethodToken,
    })
  }

  const handleReplaceClick = (method: PaymentMethod, e: React.MouseEvent) => {
    e.stopPropagation()
    setMethodToReplace(method)
    setReplaceDialogOpen(true)
  }

  const handleReplaceConfirm = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!methodToReplace || !customerPaymentMethods) return

    replacePaymentMethodMutation.mutate({
      paymentMethodToken: customerPaymentMethods[0].paymentMethodToken,
      newPaymentMethodToken: methodToReplace.paymentMethodToken,
    })
  }

  const handleActivatePayToClick = (
    method: PaymentMethod,
    e: React.MouseEvent
  ) => {
    e.stopPropagation()
    setMethodToActivate(method)
    setActivatePayToDialogOpen(true)
  }

  const handlePayToAgreement = async (
    e: MouseEvent,
    action: "authorise" | "decline" = "decline"
  ) => {
    e.preventDefault()
    if (!methodToActivate || !branch) return

    updatePayToStatusMutation.mutate({
      paymentMethodToken: methodToActivate.paymentMethodToken,
      action,
    })
  }

  return (
    <>
      <div className="min-h-9 overflow-auto space-y-2">
        {customerPaymentMethods?.map((method) => {
          const isPayTo = method.type?.toUpperCase() === "PAYTO"
          return (
            <div
              key={method.paymentMethodToken}
              className="flex items-center justify-between rounded-lg border border-border p-2"
            >
              <div className="flex items-center">
                <div className="min-w-20 justify-center flex items-center relative h-4 w-4">
                  <PaymentMethodIcon type={getPaymentMethodType(method)} />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {getPaymentMethodType(method, "card-type")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatPaymentMethodDisplay(method)?.replace(
                      /amex|visa|mastercard/i,
                      ""
                    )}{" "}
                    {method.card
                      ? `${method.card?.expiryMonth}/${method.card?.expiryYear}`
                      : ""}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                {method.primary && (
                  <Badge variant="default" className="text-xs">
                    Default
                  </Badge>
                )}
                {!method.valid && (
                  <Badge variant="destructive" className="text-xs">
                    Invalid
                  </Badge>
                )}
                {isPayTo && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1 bg-transparent"
                    onClick={(e) => handleActivatePayToClick(method, e)}
                  >
                    Agreement
                  </Button>
                )}
                <div className="flex gap-1">
                  {!method.primary && method.valid && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => handleReplaceClick(method, e)}
                      title="Make Default"
                    >
                      <Star className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {!method.primary && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={(e) => handleDeleteClick(method, e)}
                      title="Delete payment method"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Dialog
        open={activatePayToDialogOpen}
        onOpenChange={setActivatePayToDialogOpen}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>PayTo Agreement</DialogTitle>
            <DialogDescription className="italic">
              This screen it a sample on what customer might see in their
              banking app.
              <br></br>
              <br></br>
              Customer will need to agree the PayTo agreement before they can be
              used to process payments.
            </DialogDescription>
          </DialogHeader>

          {methodToActivate && (
            <div className="space-y-4 pt-18">
              <div className="rounded-lg border p-4 bg-muted/50">
                <div className="flex items-center gap-3 mb-3">
                  <PaymentMethodIcon
                    type={methodToActivate.type}
                    className="h-5 w-5"
                  />
                  <span className="font-medium">Agreement Details</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payee</span>
                    <span className="font-mono">GymFlow Pty Ltd</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account</span>
                    <span className="font-mono">
                      {methodToActivate?.payTo?.aliasId ||
                        methodToActivate?.payTo?.bBanAccountNo}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    Upto $1,000
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge
                      className="text-xs"
                      variant={
                        methodToActivate?.payTo?.mandateStatus === "ACTV"
                          ? null
                          : "destructive"
                      }
                    >
                      {methodToActivate?.payTo?.mandateReason.replaceAll(
                        /[^a-zA-Z0-9]/g,
                        ""
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setActivatePayToDialogOpen(false)}
              disabled={updatePayToStatusMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={(e) => handlePayToAgreement(e, "authorise")}
              disabled={
                updatePayToStatusMutation.isPending || methodToActivate?.valid
              }
            >
              {updatePayToStatusMutation.isPending ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Authorising...
                </>
              ) : (
                <>Authorise</>
              )}
            </Button>
            <Button
              onClick={(e) => handlePayToAgreement(e)}
              disabled={
                updatePayToStatusMutation.isPending || !methodToActivate?.valid
              }
              variant={"destructive"}
            >
              {updatePayToStatusMutation.isPending ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Declining...
                </>
              ) : (
                <>Decline</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={replaceDialogOpen} onOpenChange={setReplaceDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Make Default Payment Method</AlertDialogTitle>
            All future payments will be defaulted to this payment method.
            {methodToReplace && (
              <div className="flex mt-2 py-3 bg-muted rounded">
                <PaymentMethodIcon
                  type={getPaymentMethodType(methodToReplace)}
                ></PaymentMethodIcon>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {formatPaymentMethodDisplay(methodToReplace)}
                  </p>
                </div>
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={replacePaymentMethodMutation.isPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReplaceConfirm}
              disabled={replacePaymentMethodMutation.isPending}
            >
              {replacePaymentMethodMutation.isPending
                ? "Processing..."
                : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Method</AlertDialogTitle>
            Are you sure you want to delete this payment method? This action
            cannot be undone.
            {methodToDelete && (
              <div className="flex mt-2 py-3 bg-muted rounded">
                <PaymentMethodIcon
                  type={getPaymentMethodType(methodToDelete)}
                ></PaymentMethodIcon>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {formatPaymentMethodDisplay(methodToDelete)}
                  </p>
                </div>
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePaymentMethodMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deletePaymentMethodMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePaymentMethodMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
