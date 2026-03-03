"use client"

import { AddPaymentMethodDialog } from "@/components/members/[id]/add-payment-method-dialog"
import { PaymentMethodsList } from "@/components/shared/payment-methods-list"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useBranch } from "@/components/utils"
import { getBranchCountry } from "@/lib/branches"
import { listSingleCustomerOptions } from "@/lib/query-options/customer"
import {
  createPromptPayOptions,
  getCustomerPaymentMethodsOptions,
} from "@/lib/query-options/payment-method"
import { Customer } from "@/lib/types/customer"
import { useErrorToast } from "@/lib/utils"
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { MouseEvent, useEffect, useState } from "react"

export default function PaymentMethodsCard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const customerId = usePathname().split("/").at(-1) || ""
  const [addPaymentDialogOpen, setAddPaymentDialogOpen] = useState(false)
  const branch = useBranch()
  const queryClient = useQueryClient()

  useEffect(() => {
    const addPayment = searchParams.get("addPayment")
    if (addPayment === "true") {
      setAddPaymentDialogOpen(true)
      router.replace(`/members/${customerId}`, { scroll: false })
    }
  }, [searchParams, router])

  const {
    data: singleMemberData,
    isError,
    error,
  }: UseQueryResult<Customer> = useQuery(
    listSingleCustomerOptions(customerId, branch)
  )

  if (isError) {
    console.error(error)
    useErrorToast(`Failed to load the customer.`, error)
  }

  const createPromptPayMutation = useMutation({
    ...createPromptPayOptions(branch),
    onSuccess: () => {
      queryClient.invalidateQueries(
        getCustomerPaymentMethodsOptions(customerId, branch)
      )
    },
    onError: (error) => {
      console.error(error)
      useErrorToast(`Failed to create PromptPay token.`, error)
    },
  })

  const handleAddPaymentOpenChange = (open: boolean) => {
    setAddPaymentDialogOpen(open)
  }

  const addPromptPay = async (e: MouseEvent) => {
    e.preventDefault()
    if (customerId) createPromptPayMutation.mutate({ customerId })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription className="italic">
          This should appear in customer portal to allow customer to&nbsp;
          <Link
            href={
              "https://developer.ezypay.com/docs/payment-method-management#/"
            }
            target="_blank"
            className="underline"
          >
            manage their payment methods
          </Link>
          .
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 flex flex-col h-full justify-between">
        {customerId && <PaymentMethodsList customerId={customerId} />}

        <TooltipProvider>
          <Tooltip>
            {singleMemberData?.id && (
              <AddPaymentMethodDialog
                customerId={singleMemberData?.id}
                open={addPaymentDialogOpen}
                onOpenChange={handleAddPaymentOpenChange}
                customerEmail={singleMemberData?.email}
                customerName={`${singleMemberData?.firstName} ${singleMemberData?.lastName}`}
              >
                <TooltipTrigger asChild>
                  <Button
                    className="w-full bg-transparent"
                    variant="outline"
                    size="sm"
                  >
                    Add Payment Method
                  </Button>
                </TooltipTrigger>
              </AddPaymentMethodDialog>
            )}

            <TooltipContent>
              <p>
                Use the Ezypay's Payment capture page to collect new payment
                methods
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {getBranchCountry(branch) === "TH" && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="w-full bg-transparent"
                  variant="outline"
                  size="sm"
                  disabled={createPromptPayMutation.isPending}
                  onClick={addPromptPay}
                >
                  {createPromptPayMutation.isPending
                    ? "Adding..."
                    : "Add PromptPay"}
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                <p>Trigger the API to create a PromptPay Token</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  )
}
