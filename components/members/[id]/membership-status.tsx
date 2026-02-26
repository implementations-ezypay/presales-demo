"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useBranch } from "@/components/utils"
import { plans } from "@/lib/plan"
import { listSingleCustomerOptions } from "@/lib/query-options/customer"
import { Customer } from "@/lib/types/customer"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import RenewMembershipDialog from "./renew-membership-dialog"
import { usePathname } from "next/navigation"

export default function MembershipStatus() {
  const customerId = usePathname().split("/").at(-1) || ""
  const branch = useBranch()

  const { data: singleMemberData, isPending }: UseQueryResult<Customer> =
    useQuery(listSingleCustomerOptions(customerId, branch))

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
                {plans?.find(
                  (plan) => plan.id === singleMemberData?.metadata?.plan
                )?.name || singleMemberData?.metadata?.plan}
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
        <RenewMembershipDialog></RenewMembershipDialog>
      </CardContent>
    </Card>
  )
}
