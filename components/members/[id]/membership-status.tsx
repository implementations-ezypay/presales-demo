"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, MouseEvent } from "react"
import { Spinner } from "@/components/ui/spinner"
import { getCustomerIdFromPath } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { plans } from "@/lib/plan"
import { add, format } from "date-fns"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { listSingleCustomerOptions } from "@/lib/query-options/customer"
import { Customer } from "@/lib/types/customer"

const defaultDateFormat = "yyyy-MM-dd"
export default function MembershipStatus() {
  const customerId = getCustomerIdFromPath()

  const [renewOpen, setRenewOpen] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [branch, setBranch] = useState("")

  useEffect(() => {
    const selectedBranch = localStorage.getItem("selectedBranch") || "main"
    setBranch(selectedBranch)
  }, [])

  const { data: singleMemberData, isPending }: UseQueryResult<Customer> =
    useQuery(listSingleCustomerOptions(customerId, branch))

  const updateMembership = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    const _calculateNewDueDate = (duration: string) => {
      const d = duration.toLowerCase()
      switch (d) {
        case "weekly":
          return format(add(new Date(), { days: 7 }), defaultDateFormat)
        case "fortnightly":
          return format(add(new Date(), { weeks: 2 }), defaultDateFormat)
        case "monthly":
          return format(add(new Date(), { months: 1 }), defaultDateFormat)
        case "yearly":
          return format(add(new Date(), { years: 1 }), defaultDateFormat)
        default:
          return format(new Date(), defaultDateFormat)
      }
    }

    const found = plans.find((plan) => plan.id === selectedPlanId)
    if (!found) return
    // const { name, duration } = found

    // const newStartDate = format(new Date(), defaultDateFormat)
    // const newDueDate: string = calculateNewDueDate(duration)
    // setMemberDataState((prev) => ({
    //   ...prev,
    //   plan: name,
    //   joinDate: newStartDate,
    //   expiryDate: newDueDate,
    //   status: "active",
    // }))
    setRenewOpen(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base md:text-lg">
          Membership Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPending ? (
          <div className="flex items-center justify-center py-6">
            <Spinner className="h-6 w-6" />
          </div>
        ) : (
          <>
            <div>
              <p className="text-sm font-medium">Status</p>
              <Badge
                className="mt-1"
                variant={
                  singleMemberData?.metadata?.status === "active"
                    ? "default"
                    : singleMemberData?.metadata?.status === "trial"
                      ? "secondary"
                      : "destructive"
                }
              >
                {singleMemberData?.metadata?.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Current Plan</p>
              <p className="text-sm text-muted-foreground">
                {singleMemberData?.metadata?.plan}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Join Date</p>
              <p className="text-sm text-muted-foreground">
                {singleMemberData?.metadata?.startDate}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Expiry Date</p>
              <p className="text-sm text-muted-foreground">
                {singleMemberData?.metadata?.dueDate}
              </p>
            </div>
          </>
        )}
        <Button className="w-full bg-transparent" variant="outline">
          <Dialog open={renewOpen} onOpenChange={setRenewOpen}>
            <DialogTrigger asChild>
              <span>Renew Membership</span>
            </DialogTrigger>

            <DialogContent className="sm:max-w-120">
              <DialogHeader>
                <DialogTitle>Renew Membership</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select a plan to renew or change the member's plan.
                </p>
                <div className="grid gap-2">
                  {plans.map((plan) => (
                    <Card className="mt-1">
                      <CardContent className="px-4 py-0">
                        <label
                          key={plan.id}
                          className="flex items-center gap-4"
                        >
                          <input
                            type="radio"
                            name="plan"
                            value={plan.id}
                            checked={selectedPlanId === plan.id}
                            onChange={() => setSelectedPlanId(plan.id)}
                          />
                          <div>
                            <div className="font-medium">{plan.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ${plan.price} / {plan.duration}
                            </div>
                          </div>
                        </label>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <div className="flex gap-2">
                  <Button onClick={() => setRenewOpen(false)} variant="outline">
                    Cancel
                  </Button>
                  <Button onClick={updateMembership}>Confirm</Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Button>
      </CardContent>
    </Card>
  )
}
