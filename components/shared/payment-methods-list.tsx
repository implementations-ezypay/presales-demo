"use client"

import { useState, useEffect } from "react"
import { Trash2, Star, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  deletePaymentMethod,
  replacePaymentMethod,
  activatePayTo,
} from "@/lib/passer-functions"
import {
  cn,
  formatPaymentMethodDisplay,
  getPaymentMethodType,
} from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PaymentMethodIcon } from "@/components/ui/payment-method-icon"
import { PaymentMethod } from "@/lib/types/payment-method"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { getCustomerPaymentMethodsOptions } from "@/lib/query-options/payment-method"

interface PaymentMethodsListProps {
  customerId: string | null
  variant?: "display" | "selection"
  selectedMethodId?: string
  onMethodSelect?: (methodId: string) => void
  showInvalid?: boolean
  refreshTrigger?: number
}

export function PaymentMethodsList({
  customerId,
  variant = "display",
  selectedMethodId,
  onMethodSelect,
  showInvalid = false,
  refreshTrigger,
}: PaymentMethodsListProps) {
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [methodToDelete, setMethodToDelete] = useState<PaymentMethod | null>(
    null
  )
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false)
  const [methodToReplace, setMethodToReplace] = useState<PaymentMethod | null>(
    null
  )
  const [defaultPaymentMethod, setDefaultPaymentMethod] =
    useState<PaymentMethod | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [branch, setBranch] = useState("")
  const [activatePayToDialogOpen, setActivatePayToDialogOpen] = useState(false)
  const [methodToActivate, setMethodToActivate] =
    useState<PaymentMethod | null>(null)

  // useEffect(() => {
  //   if (customerId && branch) {
  //     fetchPaymentMethods()
  //   }
  // }, [customerId, refreshTrigger, branch])

  useEffect(() => {
    const selectedBranch = localStorage.getItem("selectedBranch") || "main"
    setBranch(selectedBranch)
  }, [])

  const {
    data,
    isPending,
    isError,
  }: UseQueryResult<{ data: PaymentMethod[] }> = useQuery(
    getCustomerPaymentMethodsOptions(customerId, branch)
  )

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-6">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-sm text-destructive py-4">
        Failed to load payment methods: {error}
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

  const customerPaymentMethods = data.data.sort((a, b) => {
    if (a.primary && !b.primary) return -1
    if (!a.primary && b.primary) return 1
    if (a.valid && !b.valid) return -1
    if (!a.valid && b.valid) return 1
    return 0
  })
  // const foundDefault = customerPaymentMethods.find((pm) => pm.primary) || null
  // setDefaultPaymentMethod(foundDefault)
  // if (onMethodSelect && foundDefault?.id) onMethodSelect(foundDefault.id)

  const handleDeleteClick = (method: PaymentMethod, e: React.MouseEvent) => {
    e.stopPropagation()
    setMethodToDelete(method)
    setDeleteDialogOpen(true)
    setActionError(null)
  }

  const handleDeleteConfirm = async () => {
    if (!methodToDelete) return

    setIsProcessing(true)
    setActionError(null)

    const deleteResult = await deletePaymentMethod(
      customerId,
      methodToDelete?.paymentMethodToken,
      branch
    )

    setIsProcessing(false)

    if (deleteResult.error) {
      setActionError(deleteResult.error.message)
      return
    }

    setMethodToDelete(null)

    await fetchPaymentMethods()
  }

  const handleReplaceClick = (method: PaymentMethod, e: React.MouseEvent) => {
    e.stopPropagation()
    setMethodToReplace(method)
    setReplaceDialogOpen(true)
    setActionError(null)
  }

  const handleReplaceConfirm = async () => {
    if (!methodToReplace) return

    setIsProcessing(true)
    setActionError(null)

    const replaceResult = await replacePaymentMethod(
      customerId,
      defaultPaymentMethod?.paymentMethodToken,
      methodToReplace?.paymentMethodToken,
      branch
    )

    setIsProcessing(false)

    if (replaceResult.error) {
      setActionError(replaceResult.error.message)
      return
    }

    setDefaultPaymentMethod(methodToReplace)
    setMethodToReplace(null)

    await fetchPaymentMethods()
  }

  const handleActivatePayToClick = (
    method: PaymentMethod,
    e: React.MouseEvent
  ) => {
    e.stopPropagation()
    setMethodToActivate(method)
    setActivatePayToDialogOpen(true)
    setActionError(null)
  }

  const handlePayToAgreement = async (action = "decline") => {
    if (!methodToActivate) return

    setIsProcessing(true)
    setActionError(null)

    try {
      const result = await activatePayTo(
        methodToActivate.paymentMethodToken,
        branch,
        action
      )

      if (!result.success) {
        setActionError(result.error?.message || "Failed to activate PayTo")
        setIsProcessing(false)
        return
      }
    } catch (err: any) {
      console.error("PayTo activation error:", err)
      setActionError(err.message || "Failed to activate PayTo")
    } finally {
      setIsProcessing(false)
      fetchPaymentMethods()
      setActivatePayToDialogOpen(false)
    }
  }

  if (variant === "selection") {
    return (
      <RadioGroup
        value={selectedMethodId || ""}
        onValueChange={(value) => onMethodSelect?.(value)}
      >
        <div className="space-y-2">
          {customerPaymentMethods?.map((method) => {
            const isInvalid = !method.valid
            const isDisabled = isInvalid && !showInvalid

            return (
              <div
                key={method.paymentMethodToken}
                className={cn(
                  "flex items-center space-x-3 rounded-lg border p-3",
                  isInvalid && "opacity-50 bg-muted",
                  !isDisabled && "cursor-pointer hover:bg-accent"
                )}
              >
                <RadioGroupItem
                  value={method.paymentMethodToken}
                  id={method.paymentMethodToken}
                  disabled={isDisabled}
                />
                <Label
                  htmlFor={method.paymentMethodToken}
                  className={cn(
                    "flex flex-1 items-center justify-between w-full",
                    isDisabled && "cursor-not-allowed"
                  )}
                  onClick={(e) => {
                    e.preventDefault()
                    onMethodSelect?.(method.paymentMethodToken)
                  }}
                >
                  <div className="flex items-center gap-3">
                    <PaymentMethodIcon
                      type={getPaymentMethodType(method)}
                      className="h-4 w-8"
                    />
                    <div>
                      <span className="text-xs text-muted-foreground">
                        {formatPaymentMethodDisplay(method)?.replace(
                          /amex|visa|mastercard/i,
                          ""
                        )}{" "}
                        {method.card
                          ? `${method.card?.expiryMonth}/${method.card?.expiryYear}`
                          : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    {method.primary && (
                      <Badge variant="default" className="text-xs">
                        Default
                      </Badge>
                    )}
                    {isInvalid && (
                      <Badge variant="destructive" className="text-xs">
                        Invalid
                      </Badge>
                    )}
                  </div>
                </Label>
              </div>
            )
          })}
        </div>
      </RadioGroup>
    )
  }

  return (
    <>
      <div className="h-56 overflow-auto space-y-2">
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
                      {methodToActivate.account || "N/A"}
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
                        methodToActivate.payTo.mandateStatus === "ACTV"
                          ? null
                          : "destructive"
                      }
                    >
                      {methodToActivate.payTo.mandateReason.replaceAll(
                        /[^a-zA-Z0-9]/g,
                        ""
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {actionError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setActivatePayToDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handlePayToAgreement("authorise")}
              disabled={isProcessing || methodToActivate?.valid}
            >
              {isProcessing ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Authorising...
                </>
              ) : (
                <>Authorise</>
              )}
            </Button>
            <Button
              onClick={() => handlePayToAgreement()}
              disabled={isProcessing || !methodToActivate?.valid}
              variant={"destructive"}
            >
              {isProcessing ? (
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
            <AlertDialogDescription>
              All future payments will be defaulted to this payment method.
              {methodToReplace && (
                <p className="mt-2 p-2 bg-muted rounded">
                  <span className="text-sm font-medium text-foreground">
                    {methodToReplace.type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {" "}
                    {methodToReplace.last4
                      ? `****${methodToReplace.last4}`
                      : ""}{" "}
                    {methodToReplace.expiry || methodToReplace.account || ""}
                  </span>
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {actionError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReplaceConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment method? This action
              cannot be undone.
              {methodToDelete && (
                <div className="mt-2 p-2 bg-muted rounded">
                  <span className="text-sm font-medium text-foreground">
                    {methodToDelete.qrPayment?.qrType ?? methodToDelete.type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {" "}
                    {methodToDelete.last4
                      ? `****${methodToDelete.last4}`
                      : ""}{" "}
                    {methodToDelete.expiry || methodToDelete.account || ""}
                  </span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {actionError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? "Processing..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
