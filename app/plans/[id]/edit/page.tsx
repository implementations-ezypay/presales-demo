"use client"

import { TopBar } from "@/components/top-bar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import PlanForm, { PlanFormData } from "@/components/plans/plan-form"
import { plans } from "@/lib/plan"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useMemo } from "react"

export default function EditPlanPage() {
  const params = useParams()
  const planId = params.id as string

  // Find the plan by ID
  const plan = useMemo(() => {
    return plans.find((p) => p.id === planId)
  }, [planId])

  // Map existing plan data to form data format
  const initialData: Partial<PlanFormData> | undefined = useMemo(() => {
    if (!plan) return undefined

    // Map duration to interval unit
    const durationToIntervalUnit: Record<string, string> = {
      Weekly: "week",
      Fortnightly: "week",
      Monthly: "month",
      Yearly: "month",
      Daily: "day",
    }

    // Map duration to interval count
    const durationToInterval: Record<string, string> = {
      Weekly: "1",
      Fortnightly: "2",
      Monthly: "1",
      Yearly: "12",
      Daily: "1",
    }

    return {
      planName: plan.name,
      description: plan.description || "",
      price: plan.price?.toString() || "",
      interval: durationToInterval[plan.duration || ""] || "",
      intervalUnit: durationToIntervalUnit[plan.duration || ""] || "",
      isPopular: plan.isPopular || false,
      // Default values for new fields that may not exist in legacy data
      startDate: new Date().toISOString().split("T")[0],
      billingType: "day_of_month",
      billingDayOfMonth: "1",
      billingDayOfWeek: "monday",
      firstBillingType: "full",
      firstBillingCustomAmount: "",
      planEndType: "ongoing",
      planEndDate: "",
      planEndAmount: "",
    }
  }, [plan])

  const handleSubmit = (data: PlanFormData) => {
    console.log("Updating plan:", planId, data)
    // TODO: Implement plan update logic
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/plans">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              {plan ? (
                <>
                  <h1 className="text-3xl font-bold tracking-tight text-balance">
                    Edit {plan.name} Plan
                  </h1>
                  <p className="text-muted-foreground">
                    Update the membership plan details
                  </p>
                </>
              ) : (
                <>
                  <Skeleton className="h-9 w-64 mb-2" />
                  <Skeleton className="h-5 w-48" />
                </>
              )}
            </div>
          </div>

          {plan ? (
            <PlanForm
              initialData={initialData}
              onSubmit={handleSubmit}
              submitLabel="Update Plan"
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Plan not found</p>
              <Link href="/plans">
                <Button variant="outline" className="mt-4">
                  Back to Plans
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
