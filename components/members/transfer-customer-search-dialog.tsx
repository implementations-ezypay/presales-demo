"use client"

import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { BRANCHES, canBranchTransferFunds } from "@/lib/branches"
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
import { toast } from "sonner"
import { useBranch } from "@/components/utils"
import { useMember } from "./utils"
import { useErrorToast } from "@/lib/utils"

export function TransferCustomerSearchDialog() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedCustomerId, setSelectedCustomerId] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("")
  const [transferPaymentMethods, setTransferPaymentMethods] = useState(true)
  const [amount, setAmount] = useState("")
  const [country, setCountry] = useState("")
  const branch = useBranch()
  const { filteredMembers } = useMember()

  const availableBranches = BRANCHES.filter(
    (b) => b.id !== branch && b.country === country
  )

  const canTransferFunds = canBranchTransferFunds(branch)

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return filteredMembers ?? []
    return (filteredMembers ?? []).filter((member) => {
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase()
      const number = (member.number ?? "").toLowerCase()
      const email = (member.email ?? "").toLowerCase()
      return (
        fullName.includes(query) ||
        number.includes(query) ||
        email.includes(query)
      )
    })
  }, [search, filteredMembers])

  const selectedMember = filteredMembers?.find(
    (m) => m.id === selectedCustomerId
  )

  const { data: selectedCustomerData }: UseQueryResult<Customer> = useQuery(
    listSingleCustomerOptions(selectedCustomerId || null, branch)
  )

  const {
    data: currentPaymentMethod,
  }: UseQueryResult<{ data: PaymentMethod[] }> = useQuery(
    getCustomerPaymentMethodsOptions(selectedCustomerId, branch)
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
      setSearch("")
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
        originalBranch: branch,
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
        <Button variant="outline" className="w-full sm:w-auto">
          <Search className="mr-2 h-4 w-4" />
          Transfer Customer Search
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Transfer Customer Search</DialogTitle>
          <DialogDescription>
            Search for a customer by name, number, or email, then choose a
            destination branch to transfer them to.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="customer-search" className="text-base font-semibold">
              Search Customer
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="customer-search"
                className="pl-9"
                placeholder="Search by name, number, or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <ScrollArea className="h-56 rounded-md border border-border">
              {searchResults.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">
                  No customers found.
                </p>
              ) : (
                <div className="p-1">
                  {searchResults.map((member) => {
                    const isSelected = member.id === selectedCustomerId
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => setSelectedCustomerId(member.id)}
                        className={`flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                          isSelected ? "bg-muted" : ""
                        }`}
                      >
                        <span className="font-medium">
                          {`${member.firstName} ${member.lastName}`}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {member.number ? `#${member.number}` : ""}
                          {member.number && member.email ? " · " : ""}
                          {member.email ?? ""}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
            {selectedMember && (
              <p className="text-sm text-muted-foreground">
                Selected:{" "}
                <span className="font-medium text-foreground">
                  {`${selectedMember.firstName} ${selectedMember.lastName}`}
                </span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch-select" className="text-base font-semibold">
              Select Branch
            </Label>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
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
              id="transfer-methods-search"
              checked={transferPaymentMethods}
              onCheckedChange={(checked) =>
                setTransferPaymentMethods(checked as boolean)
              }
            />
            <Label
              htmlFor="transfer-methods-search"
              className="flex-1 cursor-pointer"
            >
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
