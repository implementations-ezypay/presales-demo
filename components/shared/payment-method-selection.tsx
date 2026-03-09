"use client"

import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Spinner } from "@/components/ui/spinner"

import { PaymentMethodIcon } from "@/components/ui/payment-method-icon"
import { getCustomerPaymentMethodsOptions } from "@/lib/query-options/payment-method"
import { PaymentMethod } from "@/lib/types/payment-method"
import {
  cn,
  formatPaymentMethodDisplay,
  getPaymentMethodType,
} from "@/lib/utils"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { useBranch } from "../utils"
import { useEffect } from "react"

interface PaymentMethodsSelectionProps {
  customerId: string
  selectedMethodId?: string | null
  onMethodSelect: (methodId: string) => void
}

export function PaymentMethodSelection({
  customerId,
  selectedMethodId,
  onMethodSelect,
}: PaymentMethodsSelectionProps) {
  const branch = useBranch()

  const { data, isPending }: UseQueryResult<{ data: PaymentMethod[] }> =
    useQuery({
      ...getCustomerPaymentMethodsOptions(customerId, branch),
    })

  useEffect(() => {
    const primaryPaymentMethod = data?.data.filter((method) => method.primary)
    if (primaryPaymentMethod?.length === 0 || !primaryPaymentMethod) {
      onMethodSelect("")
      return
    }

    onMethodSelect(primaryPaymentMethod[0].paymentMethodToken || "")
  }, [data])

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-6">
        <Spinner className="h-6 w-6" />
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

  return (
    <RadioGroup
      value={selectedMethodId}
      onValueChange={(value) => onMethodSelect?.(value)}
    >
      <div className="space-y-2">
        {customerPaymentMethods?.map((method) => {
          const isInvalid = !method.valid
          const isDisabled = isInvalid

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
