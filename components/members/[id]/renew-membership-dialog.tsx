"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useBranch } from "@/components/utils"
import { plans } from "@/lib/plan"
import { listSingleCustomerOptions } from "@/lib/query-options/customer"
import { calculateNewDueDateFromPlan, defaultDateFormat } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { usePathname } from "next/navigation"
import { MouseEvent, useState } from "react"

export default function RenewMembershipDialog() {
  const customerId = usePathname().split("/").at(-1) || ""
  const [renewOpen, setRenewOpen] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const branch = useBranch()
  const queryClient = useQueryClient()

  const updateMembership = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    const found = plans.find((plan) => plan.id === selectedPlanId)
    if (!found) return
    const { name, id } = found

    const newStartDate = format(new Date(), defaultDateFormat)
    const newDueDate: string = calculateNewDueDateFromPlan(id, newStartDate)

    queryClient.setQueryData(
      listSingleCustomerOptions(customerId, branch).queryKey,
      (data) => {
        if (!data) return data

        return {
          ...data,
          metadata: {
            ...data.metadata,
            startDate: data.metadata?.startDate || newStartDate,
            dueDate: newDueDate,
            status: "active",
            plan: name,
          },
        }
      }
    )
    setRenewOpen(false)
  }

  return (
    <Dialog open={renewOpen} onOpenChange={setRenewOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-transparent" variant="outline">
          <span>Renew Membership</span>
        </Button>
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
                  <label key={plan.id} className="flex items-center gap-4">
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
  )
}
