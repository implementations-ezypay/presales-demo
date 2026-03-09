"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
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

  const { data: singleMemberData, isSuccess }: UseQueryResult<Customer> =
    useQuery(listSingleCustomerOptions(customerId, branch))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base md:text-lg">
          Membership Status
        </CardTitle>
      </CardHeader>
      <div className="flex flex-col h-full justify-between">
        <CardContent className="space-y-3 md:space-y-4 lg:grid lg:grid-cols-2">
          <>
            <div>
              <p className="font-medium">Status</p>
              {isSuccess && singleMemberData ? (
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
              ) : (
                <>
                  <Skeleton className="h-2 w-10 my-2" />
                </>
              )}
            </div>
            <div>
              <p className="font-medium">Current Plan</p>
              {isSuccess && singleMemberData ? (
                <p className="text-muted-foreground">
                  {plans?.find(
                    (plan) => plan.id === singleMemberData?.metadata?.plan
                  )?.name || singleMemberData?.metadata?.plan}
                </p>
              ) : (
                <>
                  <Skeleton className="h-2 w-20 my-2" />
                </>
              )}
            </div>
            <div>
              <p className="font-medium">Join Date</p>
              {isSuccess && singleMemberData ? (
                <p className="text-muted-foreground">
                  {singleMemberData?.metadata?.startDate}
                </p>
              ) : (
                <>
                  <Skeleton className="h-2 w-20 my-2" />
                </>
              )}
            </div>
            <div>
              <p className="font-medium">Expiry Date</p>
              {isSuccess && singleMemberData ? (
                <p className="text-muted-foreground">
                  {singleMemberData?.metadata?.dueDate}
                </p>
              ) : (
                <>
                  <Skeleton className="h-2 w-20 my-2" />
                </>
              )}
            </div>
          </>
        </CardContent>
        <CardContent className="flex items-center justify-center">
          {isSuccess && singleMemberData && (
            <RenewMembershipDialog></RenewMembershipDialog>
          )}
        </CardContent>
      </div>
    </Card>
  )
}
