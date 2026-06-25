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
import { BRANCHES, canBranchTransferFunds, getBranchName } from "@/lib/branches"
import Link from "next/link"
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query"
import {
  listCustomerOptions,
  listSingleCustomerOptions,
} from "@/lib/query-options/customer"
import { Customer } from "@/lib/types/customer"
import { createTransferRequestOptions } from "@/lib/query-options/transfer-customer"
import { toast } from "sonner"
import { useBranch } from "@/components/utils"
import { useErrorToast } from "@/lib/utils"

export function TransferCustomerDashboardDialog() {
  const [open, setOpen] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("")
  const [transferPaymentMethods, setTransferPaymentMethods] = useState(true)
  const [inactivateSource, setInactivateSource] = useState(false)
  const [amount, setAmount] = useState("")
  const [country, setCountry] = useState("")
  const [customerSearch, setCustomerSearch] = useState("")
  const [showResults, setShowResults] = useState(false)
  const branch = useBranch()

  const formatCustomer = (c: Customer) =>
    `${c.email ?? "No email"} — ${c.firstName} ${c.lastName}${
      c.number ? ` (${c.number})` : ""
    }`

  // Only branches that have the fund-transfer flag can be a transfer source.
  const availableBranches = BRANCHES.filter(
    (b) => b.id !== branch && b.country === country && canBranchTransferFunds(b.id)
  )

  const canTransferFunds = canBranchTransferFunds(selectedBranch)

  // Customers belonging to the selected source branch.
  const { data: branchCustomers }: UseQueryResult<{ data: Customer[] }> =
    useQuery(listCustomerOptions(selectedBranch || null))

  // Auto-filter customers by email (also matches name / Ezypay number).
  const filteredCustomers =
    branchCustomers?.data.filter((c) => {
      const q = customerSearch.trim().toLowerCase()
      if (!q) return true
      return (
        c.email?.toLowerCase().includes(q) ||
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.number?.toLowerCase().includes(q)
      )
    }) ?? []

  const { data: selectedCustomerData }: UseQueryResult<Customer> = useQuery(
    listSingleCustomerOptions(selectedCustomerId || null, selectedBranch || null)
  )

  const createTransferRequestMutation = useMutation({
    ...createTransferRequestOptions(),
    onSuccess: () => {
      const sourceName = getBranchName(selectedBranch) ?? "the source branch"
      setOpen(false)
      setSelectedCustomerId("")
      setSelectedBranch("")
      setTransferPaymentMethods(true)
      setInactivateSource(false)
      setAmount("")
      setCustomerSearch("")
      setShowResults(false)
      toast.success(
        `Transfer request submitted. Pending approval from ${sourceName}.`
      )
    },
    onError: (error) => {
      useErrorToast("Failed to submit transfer request", error)
      console.error("[v0] Transfer request error:", error)
    },
  })

  const handleTransfer = async () => {
    if (!selectedCustomerId || !selectedBranch || !selectedCustomerData) return

    createTransferRequestMutation.mutate({
      branchRequestor: branch,
      sourceBranch: selectedBranch,
      ezypayReferenceNumber:
        selectedCustomerData.number ?? selectedCustomerData.id,
      amountRemaining: canTransferFunds && amount ? Number(amount) : null,
      transferPaymentMethods,
      inactivateSource,
    })
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
            its customers to transfer into the current branch. Submitting raises
            a request that must be approved by the source branch before the
            customer is moved.
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
                setCustomerSearch("")
                setShowResults(false)
              }}
            >
              <SelectTrigger id="branch-select">
                <SelectValue placeholder="Choose a branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="select-branch" disabled>
                  Select Branch
                </SelectItem>
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
              htmlFor="customer-search"
              className="text-base font-semibold"
            >
              Search Customer
            </Label>
            <div className="relative">
              <Input
                id="customer-search"
                autoComplete="off"
                disabled={!selectedBranch}
                placeholder={
                  selectedBranch
                    ? "Search by email, name or Ezypay number"
                    : "Select a branch first"
                }
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value)
                  setSelectedCustomerId("")
                  setShowResults(true)
                }}
                onFocus={() => setShowResults(true)}
              />
              {showResults && selectedBranch && (
                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-border bg-popover shadow-md">
                  {filteredCustomers.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-muted-foreground">
                      No customers found
                    </p>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <button
                        type="button"
                        key={customer.id}
                        className="flex w-full items-center px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                        onClick={() => {
                          setSelectedCustomerId(customer.id)
                          setCustomerSearch(formatCustomer(customer))
                          setShowResults(false)
                        }}
                      >
                        {formatCustomer(customer)}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
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

          <div className="space-y-3 py-3">
            <div className="flex items-center gap-3">
              <Checkbox
                id="transfer-methods"
                checked={transferPaymentMethods}
                onCheckedChange={(checked) =>
                  setTransferPaymentMethods(checked as boolean)
                }
              />
              <Label
                htmlFor="transfer-methods"
                className="flex-1 cursor-pointer"
              >
                Transfer existing payment methods?
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="inactivate-source"
                checked={inactivateSource}
                onCheckedChange={(checked) =>
                  setInactivateSource(checked as boolean)
                }
              />
              <Label
                htmlFor="inactivate-source"
                className="flex-1 cursor-pointer"
              >
                Disabled existing account from branch
              </Label>
            </div>
          </div>

          <DialogDescription>
            Once approved by the source branch, this creates a new customer in
            the requesting branch with the customer number from the existing
            branch. Existing payment method tokens can be linked to the new
            customer account if the customer agrees to it. Refer to&nbsp;
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
              createTransferRequestMutation.isPending
            }
          >
            {createTransferRequestMutation.isPending
              ? "Submitting..."
              : "Transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
