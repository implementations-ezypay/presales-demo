"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Mail, Phone, Calendar, PersonStanding } from "lucide-react"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { listSingleCustomerOptions } from "@/lib/query-options/customer"
import { Customer } from "@/lib/types/customer"
import { usePathname } from "next/navigation"
import { useBranch } from "@/components/utils"

export default function PersonalInformation() {
  const customerId = usePathname().split("/").at(-1) || ""
  const branch = useBranch()

  const { data: singleMemberData, isSuccess }: UseQueryResult<Customer> =
    useQuery(listSingleCustomerOptions(customerId, branch))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base md:text-lg">
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4 lg:grid lg:grid-cols-2">
        <>
          <div className="flex items-center gap-3">
            <PersonStanding className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-medium">Customer Number</p>
              {isSuccess && singleMemberData ? (
                <p className="text-muted-foreground truncate">
                  {singleMemberData?.number}
                </p>
              ) : (
                <>
                  <Skeleton className="h-2 w-20 my-2" />
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-medium">Email</p>
              {isSuccess && singleMemberData ? (
                <p className="text-muted-foreground truncate">
                  {singleMemberData?.email}
                </p>
              ) : (
                <>
                  <Skeleton className="h-2 w-30 my-2" />
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-medium">Phone</p>
              {isSuccess && singleMemberData ? (
                <p className="text-muted-foreground min-h-5">
                  {singleMemberData?.mobilePhone || ""}
                </p>
              ) : (
                <>
                  <Skeleton className="h-2 w-20 my-2" />
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-medium">Date of Birth</p>
              {isSuccess && singleMemberData ? (
                <p className="text-muted-foreground min-h-5">
                  {singleMemberData?.dateOfBirth || ""}
                </p>
              ) : (
                <>
                  <Skeleton className="h-2 w-20 my-2" />
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-medium">Address</p>
              {isSuccess && singleMemberData ? (
                <p className="text-muted-foreground break-words min-h-5">
                  {Object.values(singleMemberData?.address || {}).join(" \n")}
                </p>
              ) : (
                <>
                  <Skeleton className="h-2 w-35 my-2" />
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-medium">Emergency Contact</p>
              {isSuccess && singleMemberData ? (
                <p className="text-muted-foreground break-words min-h-5">
                  {singleMemberData?.homePhone}
                </p>
              ) : (
                <>
                  <Skeleton className="h-2 w-20 my-2" />
                </>
              )}
            </div>
          </div>
        </>
      </CardContent>
    </Card>
  )
}
