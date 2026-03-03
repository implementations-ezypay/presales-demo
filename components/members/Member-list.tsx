"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getBranchName } from "@/lib/branches"
import { useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query"
import {
  listCustomerOptions,
  listSingleCustomerOptions,
} from "@/lib/query-options/customer"
import { Customer } from "@/lib/types/customer"
import { useBranch } from "../utils"
import { useMember } from "./utils"
import { plans } from "@/lib/plan"

const MemberRowSkeleton = () => (
  <TableRow>
    <TableCell>
      <Skeleton className="h-2 my-2 w-24" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-2 my-2 w-32" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-2 w-36 my-2" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-2 w-20" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-2 my-2 w-15" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-2 my-2 w-15" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-2 my-2 w-24" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-2 my-2 w-20" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-2 w-5" />
    </TableCell>
  </TableRow>
)

export default function MemberList() {
  const router = useRouter()
  const branch = useBranch()
  const { filteredMembers } = useMember()
  const queryClient = useQueryClient()

  const { isSuccess }: UseQueryResult<{ data: Customer[] }> = useQuery(
    listCustomerOptions(branch)
  )

  const redirectToMemberDetailPage = (customer: Customer) => {
    queryClient.setQueryData(
      listSingleCustomerOptions(customer.id, branch).queryKey,
      customer
    )
    queryClient.invalidateQueries(
      listSingleCustomerOptions(customer.id, branch)
    )
    router.push(`/members/${customer.id}`)
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[150px]">Customer No.</TableHead>
            <TableHead className="min-w-[150px]">Name</TableHead>
            <TableHead className="min-w-[200px]">Contact</TableHead>
            <TableHead className="min-w-[100px]">Status</TableHead>
            <TableHead className="min-w-[120px]">Plan</TableHead>
            <TableHead className="min-w-[110px]">Join Date</TableHead>
            <TableHead className="min-w-[110px]">Expiry Date</TableHead>
            <TableHead className="min-w-[110px]">Original Branch</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isSuccess ? (
            filteredMembers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  <p>No members to show</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers?.map((member) => (
                <TableRow
                  key={member.id}
                  className="cursor-pointer hover:bg-muted/50"
                  tabIndex={0}
                  role="link"
                  aria-label={`View ${member.firstName} ${member.lastName} profile`}
                  onClick={() => redirectToMemberDetailPage(member)}
                >
                  <TableCell className="font-medium">{member.number}</TableCell>

                  <TableCell className="font-medium">
                    {`${member.firstName} ${member.lastName}`}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm">{member.email}</span>
                      <span className="text-sm text-muted-foreground">
                        {member.mobilePhone}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        member.metadata?.status === "active"
                          ? "default"
                          : member.metadata?.status === "trial"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {member.metadata?.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {plans.find((plan) => plan.id === member.metadata?.plan)
                      ?.name || member.metadata?.plan}
                  </TableCell>
                  <TableCell>{member.metadata?.startDate}</TableCell>
                  <TableCell>{member.metadata?.dueDate}</TableCell>
                  <TableCell>
                    {member.metadata?.originalBranch
                      ? getBranchName(member.metadata?.originalBranch)
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/members/${member.id}`}>
                            View Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/members/${member.id}/edit`}>
                            Edit Member
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )
          ) : (
            <>
              <MemberRowSkeleton />
              <MemberRowSkeleton />
            </>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
