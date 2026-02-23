"use client"

import { TopBar } from "@/components/top-bar"
import { useEffect, useState } from "react"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { listCustomerOptions } from "@/lib/query-options/customer"
import { Customer } from "@/lib/types/customer"
import { MembershipStatus } from "@/lib/types/membership"
import MemberList from "@/components/members/Member-list"
import MemberFilter from "@/components/members/Member-filter"
import MemberTitle from "@/components/members/Member-title"

export default function MembersPage() {
  const [statusFilter, setStatusFilter] = useState<MembershipStatus>(
    "all" as MembershipStatus
  )
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [branch, setBranch] = useState<string | null>(null)

  const { data: fullCustomerData }: UseQueryResult<{ data: Customer[] }> =
    useQuery(listCustomerOptions(branch))

  // Get Branch from local storage
  useEffect(() => {
    const selectedBranch = localStorage.getItem("selectedBranch") || "main"
    setBranch(selectedBranch)
  }, [])

  const filteredMembers = fullCustomerData?.data.filter((member) => {
    const matchesStatus =
      statusFilter === ("all" as MembershipStatus) ||
      member.metadata?.status === statusFilter
    const matchesSearch = searchQuery
      .split(" ")
      .every(
        (query) =>
          member.firstName?.toLowerCase().includes(query.toLowerCase()) ||
          member.lastName?.toLowerCase().includes(query.toLowerCase()) ||
          member.email?.toLowerCase().includes(query.toLowerCase()) ||
          member.mobilePhone?.toLowerCase().includes(query.toLowerCase())
      )
    return matchesStatus && matchesSearch
  })

  return (
    <div className="flex flex-col h-full">
      <TopBar />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="space-y-4 md:space-y-6">
          <MemberTitle></MemberTitle>

          <MemberFilter
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onStatusFilterChange={(value: MembershipStatus) =>
              setStatusFilter(value as unknown as MembershipStatus)
            }
          ></MemberFilter>

          <MemberList filteredMembers={filteredMembers}></MemberList>
        </div>
      </main>
    </div>
  )
}
