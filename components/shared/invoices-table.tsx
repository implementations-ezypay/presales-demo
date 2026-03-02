"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PaymentMethodIcon } from "@/components/ui/payment-method-icon"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { listCustomerOptions } from "@/lib/query-options/customer"
import {
  listInvoiceOptions,
  listOneInvoiceOptions,
  listSingleInvoiceOptions,
} from "@/lib/query-options/invoice"
import { Customer } from "@/lib/types/customer"
import { Invoice } from "@/lib/types/invoice"
import {
  formatPaymentMethodDisplay,
  getPaymentMethodType,
  getStatusBadgeVariant,
} from "@/lib/utils"
import { useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query"
import { Search } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { MouseEvent, useState } from "react"
import { Skeleton } from "../ui/skeleton"
import { useBranch } from "../utils"
import { CreateInvoiceDialog } from "./create-invoice-dialog"

const SkeletonTableRow = ({ variant }: { variant: string }) => (
  <TableRow>
    <TableCell className="min-w-[120px]">
      <Skeleton className="w-35 h-2" />
    </TableCell>
    {variant == "billing" ? (
      <TableCell className="min-w-[150px]">
        <Skeleton className="w-25 h-2" />
      </TableCell>
    ) : (
      ""
    )}
    <TableCell className="min-w-[100px]">
      <Skeleton className="w-15 h-2" />
    </TableCell>
    <TableCell className="min-w-[150px]">
      <Skeleton className="w-45 h-2" />
    </TableCell>
    <TableCell className="min-w-[100px]">
      <Skeleton className="w-15 h-2" />
    </TableCell>
    <TableCell className="min-w-[110px]">
      <Skeleton className="w-25 h-2" />
    </TableCell>
  </TableRow>
)
const EmptyTable = () => (
  <TableRow>
    <TableCell colSpan={7} className="h-18 text-center">
      <p>No invoice to show</p>
    </TableCell>
  </TableRow>
)

export function InvoicesTable({ variant = "billing" }) {
  const customerId = usePathname().split("/").at(-1) || ""
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const branch = useBranch()
  const router = useRouter()
  const queryClient = useQueryClient()

  let invoices: Invoice[] | undefined = undefined
  let customerData: Customer | undefined = undefined

  let customerInvoiceData: { data: Invoice[] } | undefined,
    isPending: boolean,
    isSuccess: boolean

  if (variant === "billing") {
    const {
      data,
      isPending: isQueryPending,
      isSuccess: isQuerySuccess,
    }: UseQueryResult<{ data: Invoice[] }> = useQuery(
      listInvoiceOptions(branch)
    )
    invoices = customerInvoiceData?.data
    customerInvoiceData = data
    isPending = isQueryPending
    isSuccess = isQuerySuccess
  } else {
    const {
      data,
      isPending: isQueryPending,
      isSuccess: isQuerySuccess,
    }: UseQueryResult<{ data: Invoice[] }> = useQuery(
      listSingleInvoiceOptions(customerId, branch)
    )
    customerInvoiceData = data
    isPending = isQueryPending
    isSuccess = isQuerySuccess

    const { data: fullCustomerData }: UseQueryResult<{ data: Customer[] }> =
      useQuery(listCustomerOptions(branch))

    customerData = fullCustomerData?.data.find((c) => c.id === customerId)
  }

  if (isSuccess) invoices = customerInvoiceData?.data

  const filteredInvoices = invoices?.filter((invoice) => {
    const matchesStatus =
      statusFilter === "all" || invoice.status.toLowerCase() === statusFilter
    const matchesSearch =
      variant == "billing"
        ? invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          invoice.customerFirstName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          invoice.customerLastName
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        : invoice.id.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleInvoiceClick = (e: MouseEvent, invoice: Invoice) => {
    e.preventDefault()
    queryClient.setQueryData(
      listOneInvoiceOptions(invoice.id, branch).queryKey,
      invoice
    )
    queryClient.invalidateQueries(listOneInvoiceOptions(invoice.id, branch))
    router.push(`/billing/${invoice.id}`)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base md:text-lg">Invoices</CardTitle>
              <CardDescription className="text-sm">
                Generate, send, and manage member invoices
              </CardDescription>
            </div>
            <CreateInvoiceDialog
              customerId={customerData?.id || null}
              isInvoiceLoadingSuccess={isSuccess}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by invoice ID or member..."
                className="pl-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] text-sm">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="chargeback">Chargeback</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Invoice ID</TableHead>
                  {variant == "billing" ? (
                    <TableHead className="min-w-[150px]">Member</TableHead>
                  ) : (
                    ""
                  )}
                  <TableHead className="min-w-[100px]">Amount</TableHead>
                  <TableHead className="min-w-[150px]">
                    Payment Method
                  </TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[110px]">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending ? (
                  <SkeletonTableRow variant={variant} />
                ) : filteredInvoices?.length === 0 ? (
                  <EmptyTable />
                ) : (
                  filteredInvoices?.map((invoice) => (
                    <TableRow
                      key={invoice.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={(e) => handleInvoiceClick(e, invoice)}
                    >
                      <TableCell className="font-medium text-sm">
                        {invoice.documentNumber}
                      </TableCell>
                      {variant == "billing" ? (
                        <TableCell className="text-sm">{`${invoice.customerFirstName} ${invoice.customerLastName}`}</TableCell>
                      ) : (
                        ""
                      )}
                      <TableCell className="font-medium text-sm">
                        $
                        {invoice.amount.value.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <PaymentMethodIcon
                            type={getPaymentMethodType(
                              invoice.paymentMethodData
                            )}
                            className="h-5 w-10 flex-shrink-0"
                          />
                          <span className="truncate">
                            {formatPaymentMethodDisplay(
                              invoice.paymentMethodData
                            )}
                          </span>
                          {invoice.paymentMethodInvalid && (
                            <Badge variant="destructive">invalid</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(invoice.status)}
                          className="text-xs"
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {invoice.dueDate}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
