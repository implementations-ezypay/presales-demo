"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { TapToPayAnimation } from "./tap-to-pay-animation"
import { Spinner } from "@/components/ui/spinner"
import { PaymentMethodsList } from "./payment-methods-list"
import Link from "next/link"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { logApiCall } from "@/lib/api-logger"
import { PromptPayQrCode } from "./promptpay-qrcode"
import { getBranchCurrency } from "@/lib/branches"
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query"
import { listCustomerOptions } from "@/lib/query-options/customer"
import { Customer } from "@/lib/types/customer"
import {
  createCheckoutOptions,
  createInvoiceOptions,
  listInvoiceOptions,
  listSingleInvoiceOptions,
} from "@/lib/query-options/invoice"
import { CheckoutInvoiceCreation, InvoiceCreation } from "@/lib/types/invoice"
import { v4 } from "uuid"

interface CreateInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId?: string | null
}

type CreateInvoicePaymentType = "ondemand" | "tap-to-pay" | "checkout"

export function CreateInvoiceDialog({
  open,
  onOpenChange,
  customerId,
}: CreateInvoiceDialogProps) {
  const [showTapAnimation, setShowTapAnimation] = useState(false)
  const [qrString, setQrString] = useState("")
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    memberId: "",
    amount: "",
    description: "",
    paymentMethod: "ondemand" as CreateInvoicePaymentType,
    terminalId: "",
    paymentMethodId: "",
    accountingCode: "",
  })
  const [branch, setBranch] = useState("")
  const queryClient = useQueryClient()
  let customerName: string = ""

  useEffect(() => {
    const selectedBranch = localStorage.getItem("selectedBranch") || "main"
    setBranch(selectedBranch)
  }, [])

  const {
    data: fullCustomerData,
    isPending,
    isSuccess,
  }: UseQueryResult<{ data: Customer[] }> = useQuery(
    listCustomerOptions(branch)
  )

  if (isSuccess && customerId) {
    const customer = fullCustomerData.data.find((c) => c.id === customerId)
    customerName = `${customer?.firstName} ${customer?.lastName}`
    if (customerId !== formData.memberId && customer) {
      setFormData((prev) => ({ ...prev, memberId: customer.id }))
    }
  }

  const createInvoiceMutation = useMutation({
    ...createInvoiceOptions(branch),
    onSuccess: async (data) => {
      setFormData({
        memberId: customerId || "",
        amount: "",
        description: "",
        paymentMethod: "ondemand",
        terminalId: "",
        paymentMethodId: "",
        accountingCode: "",
      })

      if (data.paymentMethodData.type === "QRPAYMENT") {
        setQrString(data.qrData?.qrString)
        await new Promise((resolve) => setTimeout(resolve, 5000))
        setQrString("")
      }
      onOpenChange(false)

      await new Promise((resolve) => setTimeout(resolve, 2000))
      queryClient.invalidateQueries(
        listSingleInvoiceOptions(data.customerId, branch)
      )
      queryClient.invalidateQueries(listInvoiceOptions(branch))
    },
  })

  const createCheckoutMutation = useMutation({
    ...createCheckoutOptions(branch),
    onSuccess: (data) => {
      const { checkoutUrl } = data
      try {
        if (typeof checkoutUrl !== "string")
          throw new Error("checkoutUrl is not a string")
        // This will throw if the URL is invalid

        new URL(checkoutUrl)

        toast({
          title: "Invoice Created",
          description: "Opening checkout page...",
        })

        // Open in a new tab/window; use noopener and noreferrer for security
        if (typeof window !== "undefined") {
          window.open(checkoutUrl, "_blank", "noopener,noreferrer")
        }

        onOpenChange(false)
      } catch (err) {
        console.error("[v0] Invalid checkout URL:", err, checkoutUrl)
        toast({
          title: "Checkout Error",
          description: "Failed to open checkout URL.",
          variant: "destructive",
        })
      }
    },
  })

  const terminalDevices = [
    {
      id: "1",
      name: "Front Desk Terminal",
      deviceId: "TERM-001",
      status: "active",
    },
    {
      id: "2",
      name: "Reception Terminal",
      deviceId: "TERM-002",
      status: "active",
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.paymentMethod === "tap-to-pay" && !formData.terminalId) {
      toast({
        title: "Terminal Required",
        description: "Please select a terminal device for tap-to-pay.",
        variant: "destructive",
      })
      return
    }

    if (formData.paymentMethod === "ondemand" && !formData.paymentMethodId) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method for on-demand payment.",
        variant: "destructive",
      })
      return
    }

    try {
      const selectedTerminal = terminalDevices.find(
        (t) => t.id === formData.terminalId
      )

      if (formData.paymentMethod === "tap-to-pay") {
        console.log(
          "[v0] Initiating tap-to-pay with terminal:",
          selectedTerminal?.name
        )

        // Show tap-to-pay animation
        setShowTapAnimation(true)

        // Wait 5 seconds
        await new Promise((resolve) => setTimeout(resolve, 5000))

        // Hide animation
        setShowTapAnimation(false)

        console.log("[v0] Tap-to-pay completed successfully")
        const url =
          "https://api-sandbox.ezypay.com/v2/billing/terminal/invoices"
        const requestBody = {
          items: [
            {
              amount: {
                currency: getBranchCurrency(branch),
                value: formData.amount,
              },
              description: formData.description,
            },
          ],
          customerId: formData.memberId,
        }
        const todayDate = new Date(Date.now()).toISOString().split("T")[0]
        const responseBody = {
          id: v4(),
          creditNoteId: null,
          documentNumber: "IN0000000000000998",
          date: todayDate,
          dueDate: todayDate,
          scheduledPaymentDate: null,
          status: "PAID",
          memo: null,
          items: [
            {
              description: formData.description,
              amount: {
                currency: "AUD",
                value: formData.amount,
                type: null,
              },
              tax: {
                rate: 0,
              },
              id: "d71a77a1-bdda-488a-90b6-b1d9e3670b3f",
              type: "on_demand_payment",
              discounted: {
                currency: "AUD",
                value: 0,
                type: null,
              },
              accountingCode: null,
              reference: null,
            },
            {
              description: "Transaction fee Terminal",
              amount: {
                currency: "AUD",
                value: 2,
                type: null,
              },
              tax: {
                rate: 10,
              },
              id: "38946064-cc28-46b3-93f0-3f77b81ae1b1",
              type: "transaction_fee",
              discounted: {
                currency: "AUD",
                value: 0,
                type: null,
              },
              accountingCode: null,
              reference: null,
            },
          ],
          amount: {
            currency: "AUD",
            value: formData.amount + 2,
            type: null,
          },
          amountWithoutDiscount: {
            currency: "AUD",
            value: formData.amount + 2,
            type: null,
          },
          totalDiscounted: {
            currency: "AUD",
            value: 0,
            type: null,
          },
          totalRefunded: {
            currency: "AUD",
            value: 0,
            type: null,
          },
          totalTax: {
            currency: "AUD",
            value: 0.45,
            type: null,
          },
          customerId: formData.memberId,
          subscriptionId: null,
          checkoutId: null,
          subscriptionName: null,
          paymentMethodToken: null,
          paymentMethodData: null,
          autoPayment: false,
          processingModel: "IN_PERSON_PAYMENT",
          transactionSource: null,
          createdOn: "2025-10-07T06:38:39.674",
          payNowUrl: null,
          channel: "MOBILE_POINT_OF_SALE",
          checkoutResult: null,
          customerFirstName: null,
          customerLastName: null,
          terminalId: "0dea8104-02cd-4931-bca0-ea34bb7eac8b",
          invoiceCategory: "ONE_OFF",
          invoiceSubCategory: "TERMINAL",
        }
        if (!customerId) {
          queryClient.setQueryData(
            listInvoiceOptions(branch).queryKey,
            // @ts-expect-error: Invoice type does not fully type for API response
            (data) => {
              if (!data) return { data: [responseBody] }
              const invoices = data.data
              // @ts-expect-error: Invoice type does not fully type for API response
              invoices?.unshift(responseBody)
              return { ...data, data: invoices }
            }
          )
        } else {
          queryClient.setQueryData(
            listSingleInvoiceOptions(customerId, branch).queryKey,
            // @ts-expect-error: Invoice type does not fully type for API response
            (data) => {
              if (!data) return { data: [responseBody] }
              const invoices = data.data
              // @ts-expect-error: Invoice type does not fully type for API response
              invoices?.unshift(responseBody)
              return { ...data, data: invoices }
            }
          )
        }
        onOpenChange(false)
        logApiCall("POST", url, responseBody, 200, requestBody)
      }

      if (formData.paymentMethod === "ondemand") {
        const invoiceData: InvoiceCreation = {
          customerId: formData.memberId,
          items: [
            {
              description: formData.description || "Monthly Membership fee",
              amount: {
                currency: getBranchCurrency(branch),
                value: parseFloat(formData.amount),
              },
              ...(formData.accountingCode && {
                accountingCode: formData.accountingCode,
              }),
            },
          ],
          paymentMethodToken: formData.paymentMethodId,
        }

        createInvoiceMutation.mutate({ invoiceData })

        toast({
          title: "Invoice Created",
          description: "Invoice created successfully with on-demand payment.",
        })
      }

      if (formData.paymentMethod === "checkout") {
        const invoiceData: CheckoutInvoiceCreation = {
          customerId: formData.memberId,
          amount: {
            currency: getBranchCurrency(branch),
            value: parseFloat(formData.amount),
          },
          description: formData.description || "Monthly Memberhsip Fee",
        }

        createCheckoutMutation.mutate({ invoiceData })
      }
    } catch (error) {
      console.error("[v0] Error creating invoice:", error)
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      })
      setShowTapAnimation(false)
    }
  }

  return (
    <>
      <TapToPayAnimation open={showTapAnimation} />
      <PromptPayQrCode qrString={qrString} />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">
              Create New Invoice
            </DialogTitle>
            <DialogDescription className="text-sm">
              Create a new invoice with pending status
            </DialogDescription>
            <DialogDescription className="italic text-xs md:text-sm">
              You would create invoice in Ezypay with this also and depends on
              whether is&nbsp;
              <Link
                href={"https://developer.ezypay.com/docs/on-demand#/"}
                target="_blank"
                className="underline"
              >
                on-demand invoice,
              </Link>
              &nbsp;
              <Link
                href={"https://developer.ezypay.com/docs/checkout#/"}
                target="_blank"
                className="underline"
              >
                tap to pay invoice,
              </Link>
              &nbsp;
              <Link
                href={
                  "https://developer.ezypay.com/docs/terminal-integration#/"
                }
                target="_blank"
                className="underline"
              >
                checkout session,
              </Link>
              &nbsp;you would need to use different APIs to create the relevant
              session with Ezypay
            </DialogDescription>
          </DialogHeader>
          <form className="mt-4 md:mt-9" onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="member" className="text-sm">
                  Member
                </Label>
                {customerId ? (
                  <Input
                    id="member"
                    value={customerName || ""}
                    disabled
                    className="bg-muted"
                  />
                ) : (
                  <Select
                    value={formData.memberId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, memberId: value }))
                    }
                    required
                    disabled={isPending}
                  >
                    <SelectTrigger id="member">
                      <SelectValue
                        placeholder={
                          isPending ? "Loading customers..." : "Select a member"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {isPending ? (
                        <div className="flex justify-center py-4">
                          <Spinner className="h-6 w-6" />
                        </div>
                      ) : fullCustomerData?.data?.length === 0 ? (
                        <div className="py-4 text-center text-sm text-muted-foreground">
                          No customers found
                        </div>
                      ) : (
                        fullCustomerData?.data.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.firstName} {customer.lastName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="99.00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Monthly membership fee"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm">Payment Channel</Label>
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value: CreateInvoicePaymentType) =>
                    setFormData((prev) => ({
                      ...prev,
                      paymentMethod: value,
                      terminalId: "",
                      paymentMethodId: "",
                    }))
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ondemand" id="ondemand" />
                    <Label
                      htmlFor="ondemand"
                      className="font-normal cursor-pointer"
                    >
                      On Demand
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tap-to-pay" id="tap-to-pay" />
                    <Label
                      htmlFor="tap-to-pay"
                      className="font-normal cursor-pointer"
                    >
                      Tap to Pay
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="checkout" id="checkout" />
                    <Label
                      htmlFor="checkout"
                      className="font-normal cursor-pointer"
                    >
                      Checkout
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.paymentMethod === "ondemand" && formData.memberId && (
                <>
                  <div className="space-y-2 pt-2 border-t">
                    <Label>Select Payment Method</Label>
                    <PaymentMethodsList
                      customerId={formData.memberId}
                      variant="selection"
                      selectedMethodId={formData.paymentMethodId}
                      onMethodSelect={(methodId) =>
                        setFormData((prev) => ({
                          ...prev,
                          paymentMethodId: methodId,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountingCode" className="text-sm">
                      Accounting Code (Optional)
                    </Label>
                    <Input
                      id="accountingCode"
                      placeholder="Enter accounting code"
                      value={formData.accountingCode}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          accountingCode: e.target.value,
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Used for tracking and reconciliation in your accounting
                      system
                    </p>
                  </div>
                </>
              )}

              {formData.paymentMethod === "tap-to-pay" && (
                <div className="space-y-2 pt-2 border-t">
                  <Label htmlFor="terminal">Select Terminal Device</Label>
                  <Select
                    value={formData.terminalId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, terminalId: value }))
                    }
                    required
                  >
                    <SelectTrigger id="terminal">
                      <SelectValue placeholder="Select a terminal" />
                    </SelectTrigger>
                    <SelectContent>
                      {terminalDevices.map((device) => (
                        <SelectItem key={device.id} value={device.id}>
                          {device.name} ({device.deviceId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Only active terminals are available for selection
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createInvoiceMutation.isPending}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="submit"
                      disabled={createInvoiceMutation.isPending || isPending}
                      className="w-full sm:w-auto"
                    >
                      {createInvoiceMutation.isPending
                        ? "Creating..."
                        : "Create"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">
                      Each payment channel will trigger different Ezypay API
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
