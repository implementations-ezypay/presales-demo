"use client"

import { TopBar } from "@/components/top-bar"
import { Button } from "@/components/ui/button"
import PlanForm, { PlanFormData } from "@/components/plans/plan-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewPlanPage() {
  const handleSubmit = (data: PlanFormData) => {
    console.log("Creating plan:", data)
    // TODO: Implement plan creation logic
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
              <h1 className="text-3xl font-bold tracking-tight text-balance">
                Create Membership Plan
              </h1>
              <p className="text-muted-foreground">
                Add a new membership plan to your gym
              </p>
            </div>
          </div>

          <PlanForm onSubmit={handleSubmit} submitLabel="Create Plan" />
        </div>
      </main>
    </div>
  )
}
