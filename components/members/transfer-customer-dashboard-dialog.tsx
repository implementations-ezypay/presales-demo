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
import { BRANCHES, canBranchTransferFunds } from "@/lib/branches"
import Link from "next/link"
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query"
import {
  createCustomerOptions,
  listCustomerOptions,
  listSingleCustomerOptions,
} from "@/lib/query-options/customer"
import { Customer } from "@/lib/types/customer"
import { PaymentMethod } from "@/lib/types/payment-method"
import {
  getCustomerPaymentMethodsOptions,
  linkPaymentMethodOptions,
} from "@/lib/query-options/payment-method"
import { toast } from "sonner"
import { useBranch } from "@/components/utils"
import { useErrorToast } from "@/lib/utils"

export function TransferCustomerDashboardDialog() {
  const [open, setOpen] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("")
  const [transferPaymentMethods, setTransferPaymentMethods] = useState(true)
  const [amount, setAmount] = useState("")
  const [country, setCountry] = useState("")
  const branch = useBranch()

  // Only branches that have the fund-transfer flag can be a transfer source.
  const availableBranches = BRANCHES.filter(
    (b) => b.id !== branch && b.country === country && canBranchTransferFunds(b.id)
  )

  const canTransferFunds = canBranchTransferFunds(selectedBranch)

  // Customers belonging to the selected source branch.
  const { data: branchCustomers }: UseQueryResult<{ data: Customer[] }> =
    useQuery(listCustomerOptions(selectedBranch || null))

  const { data: selectedCustomerData }: UseQueryResult<Customer> = useQuery(
    listSingleCustomerOptions(selectedCustomerId || null, selectedBranch || null)
  )

  const {
    data: currentPaymentMethod,
  }: UseQueryResult<{ data: PaymentMethod[] }> = useQuery(
    getCustomerPaymentMethodsOptions(selectedCustomerId, selectedBranch)
  )

  const linkPaymentMethodMutation = useMutation({
    ...linkPaymentMethodOptions(branch),
    onSuccess: () => {
      toast.success("Successfully transfer existing payment method")
    },
    onError: (error) => {
      useErrorToast("Failed to link payment method", error)
      console.error("[v0] Link payment method error:", error)
    },
  })

  const createCustomerMutation = useMutation({
    ...createCustomerOptions(branch),
    onSuccess: (data) => {
      const { id: newCustomerId } = data
      if (transferPaymentMethods) {
        currentPaymentMethod?.data.forEach(async (paymentMethod) => {
          const { paymentMethodToken } = paymentMethod
          linkPaymentMethodMutation.mutate({
            customerId: newCustomerId,
            paymentMethodToken,
          })
        })
      }

      setOpen(false)
      setSelectedCustomerId("")
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
    if (!selectedCustomerId || !selectedBranch || !selectedCustomerData) return

    const customerData = {
      ...selectedCustomerData,
      metadata: {
        ...selectedCustomerData?.metadata,
        originalBranch: selectedBranch,
        ...(canTransferFunds ? { transferAmount: amount } : {}),
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
        <Button className="w-full sm:w-auto">
          <ArrowRight className="mr-2 h-4 w-4" />
          Transfer Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Transfer Customer</DialogTitle>
          <DialogDescription>
            Select a source branch that can transfer funds, then choose one of
            its customers to transfer into the current branch. Choose whether to
            transfer existing payment methods.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="branch-select" className="text-base font-semibold">
              Select Branch
            </Label>
            <Select
              value={selectedBranch}
              onValueChange={(value) => {
                setSelectedBranch(value)
                setSelectedCustomerId("")
              }}
            >
              <SelectTrigger id="branch-select">
                <SelectValue placeholder="Choose a branch" />
              </SelectTrigger>
              <SelectContent>
                {availableBranches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="customer-select"
              className="text-base font-semibold"
            >
              Select Customer
            </Label>
            <Select
              value={selectedCustomerId}
              onValueChange={setSelectedCustomerId}
              disabled={!selectedBranch}
            >
              <SelectTrigger id="customer-select">
                <SelectValue
                  placeholder={
                    selectedBranch
                      ? "Choose a customer"
                      : "Select a branch first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {branchCustomers?.data.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {`${customer.firstName} ${customer.lastName}`}
                    {customer.number ? ` (${customer.number})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {canTransferFunds && (
            <div className="space-y-2">
              <Label
                htmlFor="transfer-amount"
                className="text-base font-semibold"
              >
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
          )}

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

          <DialogDescription>
            This essentially creates a new customer in the new branch with the
            customer number from the existing branch. Existing payment method
            tokens can be linked to the new customer account if the customer
            agrees to it. Refer to&nbsp;
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
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={
              !selectedCustomerId ||
              !selectedBranch ||
              createCustomerMutation.isPending
            }
          >
            {createCustomerMutation.isPending ? "Transferring..." : "Transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
