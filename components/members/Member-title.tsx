"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { TransferCustomerDashboardDialog } from "./transfer-customer-dashboard-dialog"
import { TransferCustomerSearchDialog } from "./transfer-customer-search-dialog"

export default function MemberTitle() {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-balance">
          Members
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage your gym members and their memberships
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <TransferCustomerDashboardDialog />
        <TransferCustomerSearchDialog />
        <Button
          className="w-full sm:w-auto"
          onClick={() => router.push("/members/new")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>
    </div>
  )
}
