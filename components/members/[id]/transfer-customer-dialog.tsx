"use client"

import { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { BRANCHES } from "@/lib/branches"
import Link from "next/link"
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query"
import {
  createCustomerOptions,
  listSingleCustomerOptions,
} from "@/lib/query-options/customer"
import { Customer } from "@/lib/types/customer"
import { PaymentMethod } from "@/lib/types/payment-method"
import {
  getCustomerPaymentMethodsOptions,
  linkPaymentMethodOptions,
} from "@/lib/query-options/payment-method"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import { useBranch } from "@/components/utils"
import { useErrorToast } from "@/lib/utils"

export function TransferCustomerDialog() {
  const [open, setOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState("")
  const [transferPaymentMethods, setTransferPaymentMethods] = useState(true)
  const [amount, setAmount] = useState("")
  const branch = useBranch()
  const [country, setCountry] = useState("")
  const customerId = usePathname().split("/").at(-1) || ""

  const availableBranches = BRANCHES.filter(
    (b) => b.id !== branch && b.country === country
  )

  const {
    data: currentCustomerData,
    isPending,
    isSuccess,
  }: UseQueryResult<Customer> = useQuery(
    listSingleCustomerOptions(customerId, branch)
  )

  const {
    data: currentPaymentMethod,
  }: UseQueryResult<{ data: PaymentMethod[] }> = useQuery(
    getCustomerPaymentMethodsOptions(customerId, branch)
  )

  const linkPaymentMethodMutation = useMutation({
    ...linkPaymentMethodOptions(selectedBranch),
    onSuccess: () => {
      toast.success("Successfully transfer existing payment method")
    },
    onError: (error) => {
      useErrorToast("Failed to link payment method", error)
      console.error("[v0] Link payment method error:", error)
    },
  })

  const createCustomerMutation = useMutation({
    ...createCustomerOptions(selectedBranch),
    onSuccess: (data) => {
      const { id: customerId } = data
      currentPaymentMethod?.data.forEach(async (paymentMethod) => {
        const { paymentMethodToken } = paymentMethod
        linkPaymentMethodMutation.mutate({ customerId, paymentMethodToken })
      })

      // Close dialog on success
      setOpen(false)
      setSelectedBranch("")
      setTransferPaymentMethods(true)
      setAmount("")
      toast.success("Customer transferred successfully")
    },
    onError: (error) => {
      useErrorToast("Failed to transfer customer", error)
      console.error("[v0] Transfer customer error:", error)
    },
  })

  const handleTransfer = async () => {
    if (!selectedBranch || !isSuccess) return

    const customerData = {
      ...currentCustomerData,
      metadata: {
        ...currentCustomerData?.metadata,
        originalBranch: branch,
        transferAmount: amount,
      },
    }

    createCustomerMutation.mutate({ customerData })
  }

  useEffect(() => {
    const selectedCountry = localStorage.getItem("selectedCountry") || "AU"
    setCountry(selectedCountry)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <ArrowRight className="mr-2 h-4 w-4" />
          Transfer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Transfer Customer</DialogTitle>
          <DialogDescription>
            Transfer{" "}
            {`${currentCustomerData?.firstName} ${currentCustomerData?.lastName}`}{" "}
            to a different branch. Select the branch and choose whether to
            transfer existing payment methods.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="branch-select" className="text-base font-semibold">
              Select Branch
            </Label>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger id="branch-select">
                <SelectValue placeholder="Choose a branch" />
              </SelectTrigger>
              <SelectContent>
                {availableBranches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transfer-amount" className="text-base font-semibold">
              Amount Remaining for Full Payment
            </Label>
            <Input
              id="transfer-amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 py-3">
            <Checkbox
              id="transfer-methods"
              checked={transferPaymentMethods}
              onCheckedChange={(checked) =>
                setTransferPaymentMethods(checked as boolean)
              }
            />
            <Label htmlFor="transfer-methods" className="flex-1 cursor-pointer">
              Transfer existing payment methods?
            </Label>
          </div>

          <DialogDescription className="pb-20">
            The is essentially creating a new customer in the new branch with
            the customer number from existing branch. Exisitng payment method
            token can be linked to the new customer account if customer agree to
            it. Refer to&nbsp;
            <Link
              href="https://developer.ezypay.com/docs/customer-transfer#customer-transfer"
              target="_blank"
              className="underline"
            >
              detailed guide
            </Link>
            .
          </DialogDescription>
        </div>

        <DialogFooter className="pb-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={!selectedBranch || createCustomerMutation.isPending}
          >
            {createCustomerMutation.isPending ? "Transferring..." : "Transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
