"use client"

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { listCustomerOptions } from "@/lib/query-options/customer"
import { Customer } from "@/lib/types/customer"
import { MembershipStatus } from "@/lib/types/membership"
import { BranchContext } from "@/app/Provider"

type MemberContextType = {
  searchQuery: string
  setSearchQuery: Dispatch<SetStateAction<string>>
  filteredMembers: Customer[] | undefined
  statusFilter: MembershipStatus
  setStatusFilter: Dispatch<SetStateAction<MembershipStatus>>
}

export const MemberContext = createContext<MemberContextType | undefined>(
  undefined
)

export default function MemberContextProvider({
  children,
}: {
  children: ReactNode
}) {
  const [statusFilter, setStatusFilter] = useState<MembershipStatus>(
    "all" as MembershipStatus
  )
  const [searchQuery, setSearchQuery] = useState<string>("")
  const branch = useContext(BranchContext)

  const { data: fullCustomerData }: UseQueryResult<{ data: Customer[] }> =
    useQuery(listCustomerOptions(branch))

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
    <MemberContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        filteredMembers,
        statusFilter,
        setStatusFilter,
      }}
    >
      {children}
    </MemberContext.Provider>
  )
}
