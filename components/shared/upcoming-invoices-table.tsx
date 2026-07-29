"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Trash2, Edit2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PaymentMethodIcon } from "../ui/payment-method-icon"
import { useBranch } from "../utils"
import axios from "axios"
import { listInvoiceOptions } from "@/lib/query-options/invoice"
import { getEzypayToken } from "@/lib/ezypay-token"
import { getBranchCredentials } from "@/lib/branch-config"
import { logApiCall } from "@/lib/api-logger"

const upcomingInvoicesData = [
  {
    id: "INV00012345678",
    member: "John Doe",
    date: new Date().toISOString().split("T")[0],
    amount: "$99.00",
    status: "pending" as const,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    paymentMethod: "Visa ****4242",
    paymentAttempts: [],
  },
  {
    id: "INV00012345679",
    member: "Sarah Smith",
    date: new Date().toISOString().split("T")[0],
    amount: "$49.00",
    status: "pending" as const,
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    paymentMethod: "Mastercard ****5678",
    paymentAttempts: [],
  },
  {
    id: "INV00012345680",
    member: "Mike Johnson",
    date: new Date().toISOString().split("T")[0],
    amount: "$149.00",
    status: "pending" as const,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    paymentMethod: "Visa ****9012",
    paymentAttempts: [],
  },
  {
    id: "INV00012345681",
    member: "Emma Wilson",
    date: new Date().toISOString().split("T")[0],
    amount: "$99.00",
    status: "pending" as const,
    dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    paymentMethod: "Visa ****3456",
    paymentAttempts: [],
  },
]

export function UpcomingInvoicesTable() {
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null)
  const [editInvoiceId, setEditInvoiceId] = useState<string | null>(null)
  const branch = useBranch()
  const queryClient = useQueryClient()

  // Delete invoice mutation
  const deleteInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const { merchantId } = await getBranchCredentials(branch)
      const tokenData = await getEzypayToken(branch)
      const token = tokenData.access_token

      const apiEndpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v2/billing/invoices`
      const url = `${apiEndpoint}/${invoiceId}`

      const response = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          merchant: merchantId,
          "Content-type": "application/json",
        },
      })

      logApiCall("DELETE", url, response.data, response.status, {})
      return response.data
    },
    onSuccess: () => {
      setDeleteInvoiceId(null)
      toast.success("Invoice deleted successfully")
      queryClient.invalidateQueries(listInvoiceOptions(branch))
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete invoice"
      toast.error(`Error: ${errorMessage}`, { duration: 30000 })
      console.error("[v0] Delete invoice error:", error)
    },
  })

  // Edit invoice mutation (write-off for pending invoices)
  const editInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const { merchantId } = await getBranchCredentials(branch)
      const tokenData = await getEzypayToken(branch)
      const token = tokenData.access_token

      const apiEndpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v2/billing/invoices`
      const url = `${apiEndpoint}/${invoiceId}/writeoff`

      const response = await axios.post(
        url,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            merchant: merchantId,
            "Content-type": "application/json",
          },
        }
      )

      logApiCall("POST", url, response.data, response.status, {})
      return response.data
    },
    onSuccess: () => {
      setEditInvoiceId(null)
      toast.success("Invoice updated successfully")
      queryClient.invalidateQueries(listInvoiceOptions(branch))
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update invoice"
      toast.error(`Error: ${errorMessage}`, { duration: 30000 })
      console.error("[v0] Edit invoice error:", error)
    },
  })

  const handleDelete = (invoiceId: string) => {
    setDeleteInvoiceId(invoiceId)
  }

  const handleEdit = (invoiceId: string) => {
    setEditInvoiceId(invoiceId)
  }

  const confirmDelete = () => {
    if (deleteInvoiceId) {
      deleteInvoiceMutation.mutate(deleteInvoiceId)
    }
  }

  const confirmEdit = () => {
    if (editInvoiceId) {
      editInvoiceMutation.mutate(editInvoiceId)
    }
  }

  return (
    <>
      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteInvoiceId} onOpenChange={setDeleteInvoiceId}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invoice? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteInvoiceMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteInvoiceMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit confirmation dialog */}
      <AlertDialog open={!!editInvoiceId} onOpenChange={setEditInvoiceId}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Write Off Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to write off this invoice? This will mark
              it as completed without payment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmEdit}
              disabled={editInvoiceMutation.isPending}
            >
              {editInvoiceMutation.isPending ? "Processing..." : "Write Off"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Upcoming Invoices</CardTitle>
            <CardDescription>
              Scheduled invoices pending payment
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingInvoicesData.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell className="font-medium">
                    {invoice.amount}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <PaymentMethodIcon
                        type={invoice.paymentMethod}
                        className="h-4 w-4 flex-shrink-0"
                      />
                      {invoice.paymentMethod}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{invoice.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(invoice.id)}
                        disabled={editInvoiceMutation.isPending}
                        title="Write off invoice"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(invoice.id)}
                        disabled={deleteInvoiceMutation.isPending}
                        title="Delete invoice"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
