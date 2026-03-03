"use client"

import { AttendanceLog } from "@/components/members/[id]/attendance-log"
import MembershipStatus from "@/components/members/[id]/membership-status"
import PaymentMethodsCard from "@/components/members/[id]/payment-methods-card"
import PersonalInformation from "@/components/members/[id]/personal-information"
import { TransferCustomerDialog } from "@/components/members/[id]/transfer-customer-dialog"
import { InvoicesTable } from "@/components/shared/invoices-table"
import { UpcomingInvoicesTable } from "@/components/shared/upcoming-invoices-table"
import { TopBar } from "@/components/top-bar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBranch } from "@/components/utils"
import { getBranchName } from "@/lib/branches"
import { listSingleCustomerOptions } from "@/lib/query-options/customer"
import { Customer } from "@/lib/types/customer"
import { useErrorToast } from "@/lib/utils"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { Edit } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function MemberProfilePage() {
  const customerId = usePathname().split("/").at(-1) || ""
  const branch = useBranch()

  const {
    data: singleMemberData,
    isSuccess,
    isError,
    error,
  }: UseQueryResult<Customer> = useQuery(
    listSingleCustomerOptions(customerId, branch)
  )

  if (isError) {
    console.error(error)
    useErrorToast(`Failed to load the customer.`, error)
  }

  return (
    <div className="flex flex-col h-full relative">
      <TopBar />
      <main className="flex-1 overflow-y-auto p4 md:p-6 p-6">
        <div className="space-y-4 md:space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-h-15">
            {/* Page Title */}
            <div>
              {isSuccess && singleMemberData ? (
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-balance min-w-56">
                  {`${singleMemberData?.firstName} ${singleMemberData?.lastName}`}
                </h1>
              ) : (
                <div>
                  <Skeleton className="h-3 w-56 my-3" />
                </div>
              )}
              <p className="text-sm md:text-base text-muted-foreground">
                Member profile and activity
              </p>
            </div>
            {singleMemberData?.metadata?.originalBranch && (
              <div>
                <p className="text-sm md:text-base text-muted-foreground min-w-56">
                  Original Branch:{" "}
                  {getBranchName(singleMemberData?.metadata?.originalBranch)}
                </p>
              </div>
            )}
            <div className="lg:w-200 w-0"></div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Link
                href={`/members/${singleMemberData?.id}/edit`}
                className="flex-1 sm:flex-none"
              >
                <Button className="w-full sm:w-auto">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </Link>
              {<TransferCustomerDialog />}
            </div>
          </div>

          <div className="grid gap-4 md:gap-6 lg:grid-cols-3 min-h-[300px]">
            <PersonalInformation />

            <MembershipStatus />

            <PaymentMethodsCard />
          </div>

          <Tabs defaultValue="invoices" className="space-y-4">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="invoices" className="flex-shrink-0">
                Invoices
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex-shrink-0">
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="attendance" className="flex-shrink-0">
                Attendance Logs
              </TabsTrigger>
            </TabsList>
            <TabsContent value="invoices">
              {<InvoicesTable variant="customer" />}
            </TabsContent>
            <TabsContent value="upcoming">
              <UpcomingInvoicesTable />
            </TabsContent>
            <TabsContent value="attendance">
              <AttendanceLog />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
