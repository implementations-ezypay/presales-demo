"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"
import { MembershipStatus } from "@/lib/types/membership"
import { useMember } from "./utils"

export default function MemberFilter() {
  const { searchQuery, setSearchQuery, statusFilter, setStatusFilter } =
    useMember()

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by name or email..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <Select
        value={statusFilter}
        onValueChange={(value: MembershipStatus) =>
          setStatusFilter(value as unknown as MembershipStatus)
        }
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(MembershipStatus).map((status) => (
            <SelectItem value={status} key={status}>
              {MembershipStatus[status as keyof typeof MembershipStatus]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
