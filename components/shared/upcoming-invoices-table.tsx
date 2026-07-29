"use client"

import { useState } from "react"
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

const initialInvoicesData = [
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
  const [invoices, setInvoices] = useState(initialInvoicesData)
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null)
  const [editInvoiceId, setEditInvoiceId] = useState<string | null>(null)

  const handleDelete = (invoiceId: string) => {
    setDeleteInvoiceId(invoiceId)
  }

  const handleEdit = (invoiceId: string) => {
    setEditInvoiceId(invoiceId)
  }

  const confirmDelete = () => {
    if (deleteInvoiceId) {
      setInvoices(invoices.filter((inv) => inv.id !== deleteInvoiceId))
      setDeleteInvoiceId(null)
      toast.success("Invoice deleted successfully")
    }
  }

  const confirmEdit = () => {
    if (editInvoiceId) {
      setInvoices(
        invoices.map((inv) =>
          inv.id === editInvoiceId ? { ...inv, status: "written-off" as const } : inv
        )
      )
      setEditInvoiceId(null)
      toast.success("Invoice written off successfully")
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
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
            <AlertDialogAction onClick={confirmEdit}>
              Write Off
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
              {invoices.map((invoice) => (
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
                        title="Write off invoice"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(invoice.id)}
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
