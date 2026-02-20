"use client"

import { TopBar } from "@/components/top-bar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit } from "lucide-react"
import Link from "next/link"
import { AddPaymentMethodDialog } from "@/components/billing/add-payment-method-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PaymentMethodsList } from "@/components/shared/payment-methods-list"
import { useState, useEffect } from "react"
import { Spinner } from "@/components/ui/spinner"
import { getCustomerIdFromPath } from "@/lib/utils"
import { useSearchParams, useRouter } from "next/navigation"
import { getBranchCountry, getBranchName } from "@/lib/branches"
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query"
import { listSingleCustomerOptions } from "@/lib/query-options/customer"
import { Customer } from "@/lib/types/customer"
import { UpcomingInvoicesTable } from "@/components/shared/upcoming-invoices-table"
import { AttendanceLog } from "@/components/members/[id]/attendance-log"
import PersonalInformation from "@/components/members/[id]/personal-information"
import MembershipStatus from "@/components/members/[id]/membership-status"
import { InvoicesTable } from "@/components/shared/invoices-table"
import { TransferCustomerDialog } from "@/components/billing/transfer-customer-dialog"
import {
  createPromptPayOptions,
  getCustomerPaymentMethodsOptions,
} from "@/lib/query-options/payment-method"

export default function MemberProfilePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const customerId = getCustomerIdFromPath()
  const [paymentMethodsRefreshTrigger, setPaymentMethodsRefreshTrigger] =
    useState(0)
  const [addPaymentDialogOpen, setAddPaymentDialogOpen] = useState(false)
  const [branch, setBranch] = useState("")
  const queryClient = useQueryClient()

  useEffect(() => {
    const addPayment = searchParams.get("addPayment")
    if (addPayment === "true") {
      setAddPaymentDialogOpen(true)
      router.replace(`/members/${customerId}`, { scroll: false })
    }
  }, [searchParams, router])

  useEffect(() => {
    const selectedBranch = localStorage.getItem("selectedBranch") || "main"
    setBranch(selectedBranch)
  }, [])

  const { data: singleMemberData, isPending }: UseQueryResult<Customer> =
    useQuery(listSingleCustomerOptions(customerId, branch))

  const createPromptPayMutation = useMutation({
    ...createPromptPayOptions(branch),
    onSuccess: () => {
      queryClient.invalidateQueries(
        getCustomerPaymentMethodsOptions(customerId, branch)
      )
    },
    onError: (error) => {
      console.log(error)
    },
  })

  const handleAddPaymentOpenChange = (open: boolean) => {
    setAddPaymentDialogOpen(open)
    if (!open) {
      setPaymentMethodsRefreshTrigger((prev) => prev + 1)
    }
  }

  const addPromptPay = async (e) => {
    e.preventDefault()
    createPromptPayMutation.mutate({ customerId })
  }

  return (
    <div className="flex flex-col h-full relative">
      <TopBar />
      <main className="flex-1 overflow-y-auto p4 md:p-6 p-6">
        <div className="space-y-4 md:space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-h-15">
            {/* Loading Spinner */}
            {isPending && (
              <div className="flex items-left justify-center pb-2 ps-10">
                <Spinner className="h-6 w-6" />
              </div>
            )}

            {/* Page Title */}
            {!isPending && (
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-balance">
                  {`${singleMemberData?.firstName} ${singleMemberData?.lastName}`}
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Member profile and activity
                </p>
              </div>
            )}
            {singleMemberData?.metadata?.originalBranch && (
              <div>
                <p className="text-sm md:text-base text-muted-foreground">
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

          <div className="grid gap-4 md:gap-6 lg:grid-cols-3 min-h-[400px]">
            <PersonalInformation />

            <MembershipStatus />

            {/* Payment Methods Card */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription className="italic">
                  This should appear in customer portal to allow customer
                  to&nbsp;
                  <Link
                    href={
                      "https://developer.ezypay.com/docs/payment-method-management#/"
                    }
                    target="_blank"
                    className="underline"
                  >
                    manage their payment methods
                  </Link>
                  .
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <PaymentMethodsList
                  customerId={customerId}
                  variant="display"
                  refreshTrigger={paymentMethodsRefreshTrigger}
                />

                <TooltipProvider>
                  <Tooltip>
                    <AddPaymentMethodDialog
                      customerId={singleMemberData?.id}
                      open={addPaymentDialogOpen}
                      onOpenChange={handleAddPaymentOpenChange}
                      customerEmail={singleMemberData?.email}
                      customerName={`${singleMemberData?.firstName} ${singleMemberData?.lastName}`}
                    >
                      <TooltipTrigger asChild>
                        <Button
                          className="w-full bg-transparent"
                          variant="outline"
                          size="sm"
                        >
                          Add Payment Method
                        </Button>
                      </TooltipTrigger>
                    </AddPaymentMethodDialog>

                    <TooltipContent>
                      <p>
                        Use the Ezypay's Payment capture page to collect new
                        payment methods
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {getBranchCountry(branch) === "TH" && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          className="w-full bg-transparent"
                          variant="outline"
                          size="sm"
                          disabled={createPromptPayMutation.isPending}
                          onClick={addPromptPay}
                        >
                          {createPromptPayMutation.isPending
                            ? "Adding..."
                            : "Add PromptPay"}
                        </Button>
                      </TooltipTrigger>

                      <TooltipContent>
                        <p>Trigger the API to create a PromptPay Token</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </CardContent>
            </Card>
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
