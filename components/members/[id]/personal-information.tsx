"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Mail, Phone, Calendar, PersonStanding } from "lucide-react"

import { useState, useEffect } from "react"
import { Spinner } from "@/components/ui/spinner"
import { getCustomerIdFromPath } from "@/lib/utils"

import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { listSingleCustomerOptions } from "@/lib/query-options/customer"
import { Customer } from "@/lib/types/customer"

export default function PersonalInformation() {
  const customerId = getCustomerIdFromPath()
  const [branch, setBranch] = useState("")

  useEffect(() => {
    const selectedBranch = localStorage.getItem("selectedBranch") || "main"
    setBranch(selectedBranch)
  }, [])

  const { data: singleMemberData, isPending }: UseQueryResult<Customer> =
    useQuery(listSingleCustomerOptions(customerId, branch))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base md:text-lg">
          Personal Information
        </CardTitle>
      </CardHeader>
      {isPending ? (
        <div className="flex items-center justify-center py-6">
          <Spinner className="h-6 w-6" />
        </div>
      ) : (
        <CardContent className="space-y-3 md:space-y-4">
          <div className="flex items-center gap-3 ">
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
              <p className="text-sm text-muted-foreground">
                {singleMemberData?.mobilePhone}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium">Date of Birth</p>
              <p className="text-sm text-muted-foreground">
                {singleMemberData?.dateOfBirth}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Address</p>
            <p className="text-sm text-muted-foreground break-words">
              {Object.values(singleMemberData?.address || {}).join(" \n")}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Emergency Contact</p>
            <p className="text-sm text-muted-foreground break-words">
              {singleMemberData?.homePhone}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
