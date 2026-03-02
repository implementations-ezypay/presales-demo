"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Mail, Phone, Calendar, PersonStanding } from "lucide-react"
import { useState, useEffect } from "react"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { listSingleCustomerOptions } from "@/lib/query-options/customer"
import { Customer } from "@/lib/types/customer"
import { usePathname } from "next/navigation"

const InfoFieldSkeleton = () => (
  <div className="flex items-center gap-3">
    <div className="h-4 w-4 flex-shrink-0 bg-muted rounded" />
    <div className="min-w-0 w-full">
      <Skeleton className="h-3 w-20 mb-2" />
      <Skeleton className="h-4 w-32" />
    </div>
  </div>
)

export default function PersonalInformation() {
  const customerId = usePathname().split("/").at(-1) || ""
  const [branch, setBranch] = useState("")

  useEffect(() => {
    const selectedBranch = localStorage.getItem("selectedBranch") || "main"
    setBranch(selectedBranch)
  }, [])

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
        {isSuccess && singleMemberData ? (
          <>
            <div className="flex items-center gap-3">
              <PersonStanding className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Customer Number</p>
                <p className="text-sm text-muted-foreground truncate">
                  {singleMemberData?.number}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground truncate">
                  {singleMemberData?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground min-h-5">
                  {singleMemberData?.mobilePhone || ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Date of Birth</p>
                <p className="text-sm text-muted-foreground min-h-5">
                  {singleMemberData?.dateOfBirth || ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-muted-foreground break-words min-h-5">
                  {Object.values(singleMemberData?.address || {}).join(" \n")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Emergency Contact</p>
                <p className="text-sm text-muted-foreground break-words min-h-5">
                  {singleMemberData?.homePhone}
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <InfoFieldSkeleton />
            <InfoFieldSkeleton />
            <InfoFieldSkeleton />
            <InfoFieldSkeleton />
            <InfoFieldSkeleton />
            <InfoFieldSkeleton />
          </>
        )}
      </CardContent>
    </Card>
  )
}
