"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getBranchCurrency } from "@/lib/branches"
import { listCustomerOptions } from "@/lib/query-options/customer"
import {
  createCheckoutOptions,
  createInvoiceOptions,
  createTerminalInvoiceOptions,
  listInvoiceOptions,
  listSingleInvoiceOptions,
} from "@/lib/query-options/invoice"
import { terminalDevices } from "@/lib/terminal-devices"
import { Customer } from "@/lib/types/customer"
import {
  CheckoutInvoiceCreation,
  InvoiceCreation,
  TerminalInvoiceCreation,
} from "@/lib/types/invoice"
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "../ui/badge"
import { useBranch } from "../utils"
import { PaymentMethodSelection } from "./payment-method-selection"
import { PromptPayQrCode } from "./promptpay-qrcode"
import { TapToPayAnimation } from "./tap-to-pay-animation"

interface CreateInvoiceDialogProps {
  customerId?: string | null
  isInvoiceLoadingSuccess?: boolean
}

type InvoiceCreateFormType = {
  memberId: string
  amount: string
  description: string
  paymentMethod: CreateInvoicePaymentType
  terminalId?: string
  paymentMethodId?: string
  accountingCode?: string
}

const defaultFormData: InvoiceCreateFormType = {
  memberId: "",
  amount: "",
  description: "",
  paymentMethod: "ondemand" as CreateInvoicePaymentType,
  paymentMethodId: "",
}

const defaultInvoiceDescription: string = "Monthly Membership Fee"

type CreateInvoicePaymentType = "ondemand" | "tap-to-pay" | "checkout"

export function CreateInvoiceDialog({
  customerId,
  isInvoiceLoadingSuccess,
}: CreateInvoiceDialogProps) {
  const [showTapAnimation, setShowTapAnimation] = useState(false)
  const [qrString, setQrString] = useState("")
  const [open, setOpen] = useState(false)
  const [formData, setFormData] =
    useState<InvoiceCreateFormType>(defaultFormData)
  const queryClient = useQueryClient()
  const branch = useBranch()

  const {
    data: fullCustomerData,
    isPending,
    isSuccess,
  }: UseQueryResult<{ data: Customer[] }> = useQuery(
    listCustomerOptions(branch)
  )

  if (isSuccess && customerId) {
    const customer = fullCustomerData.data.find((c) => c.id === customerId)
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
        await new Promise((resolve) => setTimeout(resolve, 10000))
        setQrString("")
      }
      setOpen(false)
      toast.success("Invoice successfully created")

      await new Promise((resolve) => setTimeout(resolve, 2000))
      queryClient.invalidateQueries(
        listSingleInvoiceOptions(data.customerId, branch)
      )
      queryClient.invalidateQueries(listInvoiceOptions(branch))
    },
    onError: (error) => {
      toast.error(
        `Failed to create invoice: ${error instanceof Error ? error.message : "Unknown error"}`,
        { duration: 30000 }
      )
      console.error("[v0] Create invoice error:", error)
    },
  })

  const createTerminalInvoiceMutation = useMutation({
    ...createTerminalInvoiceOptions(branch),
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

      toast.success("Terminal invoice created successfully")
      await new Promise((resolve) => setTimeout(resolve, 2000))
      queryClient.invalidateQueries(
        listSingleInvoiceOptions(data.customerId, branch)
      )
      queryClient.invalidateQueries(listInvoiceOptions(branch))
    },
    onError: (error) => {
      toast.error(
        `Failed to create terminal invoice: ${error instanceof Error ? error.message : "Unknown error"}`,
        { duration: 30000 }
      )
      console.error("[v0] Terminal invoice error:", error)
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

        toast.success("Checkout invoice created: Opening Checkout page...")

        // Open in a new tab/window; use noopener and noreferrer for security
        if (typeof window !== "undefined") {
          window.open(checkoutUrl, "_blank", "noopener,noreferrer")
        }

        setOpen(false)
      } catch (err) {
        console.error("[v0] Invalid checkout URL:", err, checkoutUrl)
        toast.error(
          "Checkout error: Failed to open checkout Page. Check console for details.",
          { duration: 30000 }
        )
      }
    },
    onError: (error) => {
      toast.error(
        `Failed to create checkout: ${error instanceof Error ? error.message : "Unknown error"}`,
        { duration: 30000 }
      )
      console.error("[v0] Checkout creation error:", error)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const selectedTerminal = terminalDevices.find(
      (t) => t.id === formData.terminalId
    )

    if (formData.paymentMethod === "tap-to-pay") {
      if (!formData.terminalId) {
        toast.error("Terminal devices required")
        return
      }
      console.log(
        "[v0] Initiating tap-to-pay with terminal:",
        selectedTerminal?.name
      )
      const invoiceData: TerminalInvoiceCreation = {
        items: [
          {
            amount: {
              currency: getBranchCurrency(branch),
              value: parseFloat(formData.amount),
            },
            description: formData.description || "In-person Payment",
          },
        ],
        customerId: formData.memberId,
        terminalId: formData.terminalId,
      }

      createTerminalInvoiceMutation.mutate({ invoiceData })

      // Show tap-to-pay animation
      setShowTapAnimation(true)

      // Wait 5 seconds
      await new Promise((resolve) => setTimeout(resolve, 5000))

      // Hide animation
      setShowTapAnimation(false)

      setOpen(false)
    }

    if (formData.paymentMethod === "ondemand") {
      if (!formData.paymentMethodId) {
        toast.error(
          "Payment method required, please select a payment method before proceeding"
        )
        return
      }
      const invoiceData: InvoiceCreation = {
        customerId: formData.memberId,
        items: [
          {
            description: formData.description || defaultInvoiceDescription,
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
    }

    if (formData.paymentMethod === "checkout") {
      const invoiceData: CheckoutInvoiceCreation = {
        customerId: formData.memberId,
        amount: {
          currency: getBranchCurrency(branch),
          value: parseFloat(formData.amount),
        },
        description: formData.description || defaultInvoiceDescription,
      }

      createCheckoutMutation.mutate({ invoiceData })
    }
  }

  return (
    <>
      <TapToPayAnimation open={showTapAnimation} />
      <PromptPayQrCode qrString={qrString} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            onClick={() => setOpen(true)}
            className="w-full sm:w-auto"
            disabled={!isInvoiceLoadingSuccess}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-4">
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
              {/* Member selection */}
              <div className="space-y-2">
                <Label htmlFor="member" className="text-sm">
                  Member
                </Label>

                <Select
                  value={formData.memberId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, memberId: value }))
                  }
                  required
                  disabled={isPending || Boolean(customerId)}
                >
                  <SelectTrigger id="member">
                    <SelectValue
                      placeholder={
                        isPending ? "Loading members..." : "Select a member"
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
              </div>

              {/* Amount Label */}
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

              {/* Description Label */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder={defaultInvoiceDescription}
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

              {/* Payment Channel Radio Group */}
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

              {/* On Demand payment Method List */}
              {formData.paymentMethod === "ondemand" && formData.memberId && (
                <>
                  <div className="space-y-2 pt-2 border-t">
                    <Label>Select Payment Method</Label>
                    <PaymentMethodSelection
                      customerId={formData.memberId}
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

              {/* Terminal Devices selection */}
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
                        <SelectItem
                          key={device.id}
                          value={device.id}
                          disabled={device.status == "inactive"}
                        >
                          <p className="w-40">{device.name}</p>
                          <Badge
                            variant={
                              device.status == "inactive"
                                ? "destructive"
                                : "default"
                            }
                          >
                            {device.status}
                          </Badge>
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
                onClick={() => setOpen(false)}
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
                      {createInvoiceMutation.isPending ||
                      createCheckoutMutation.isPending ||
                      createInvoiceMutation.isPending ||
                      createTerminalInvoiceMutation.isPending
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
