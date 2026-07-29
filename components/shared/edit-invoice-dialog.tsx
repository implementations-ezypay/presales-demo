"use client"

import { useState } from "react"
import { Trash2, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface InvoiceItem {
  id: string
  description: string
  amount: string
  quantity: number
  type: "subscription_payment" | "addon_payment" | "setup_payment"
}

interface EditInvoiceDialogProps {
  invoice: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updatedInvoice: any) => void
}

export function EditInvoiceDialog({
  invoice,
  open,
  onOpenChange,
  onSave,
}: EditInvoiceDialogProps) {
  const [items, setItems] = useState<InvoiceItem[]>(
    invoice
      ? [
          {
            id: "1",
            description: "Membership",
            amount: invoice.amount.replace("$", ""),
            quantity: 1,
            type: "subscription_payment",
          },
        ]
      : []
  )
  const [memberName, setMemberName] = useState(invoice?.member || "")
  const [dueDate, setDueDate] = useState(invoice?.dueDate || "")

  const calculateTotal = () => {
    return items
      .reduce((sum, item) => {
        const amount = parseFloat(item.amount) || 0
        return sum + amount
      }, 0)
      .toFixed(2)
  }

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      amount: "",
      quantity: 1,
      type: "subscription_payment",
    }
    setItems([...items, newItem])
  }

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) {
      toast.error("Invoice must have at least one item")
      return
    }
    setItems(items.filter((item) => item.id !== id))
  }

  const handleItemChange = (
    id: string,
    field: keyof InvoiceItem,
    value: any
  ) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const handleSave = () => {
    if (items.length === 0) {
      toast.error("Please add at least one item")
      return
    }

    const total = calculateTotal()
    const updatedInvoice = {
      ...invoice,
      member: memberName,
      dueDate,
      amount: `$${total}`,
      items,
    }

    onSave(updatedInvoice)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Invoice</DialogTitle>
          <DialogDescription>
            Update invoice details and items
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="member-name">Member Name</Label>
              <Input
                id="member-name"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="Enter member name"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date</Label>
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>         

          {/* Invoice Items */}
          <div className="space-y-3">
            <Label>Items</Label>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-32">Type</TableHead>
                    <TableHead className="w-24">Amount</TableHead>
                    <TableHead className="w-12 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const itemTotal = (
                      parseFloat(item.amount || "0") * item.quantity
                    ).toFixed(2)
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Input
                            value={item.description}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Item description"
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.type}
                            onValueChange={(value) =>
                              handleItemChange(
                                item.id,
                                "type",
                                value as "subscription_payment" | "addon_payment" | "setup_payment"
                              )
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="subscription_payment">
                                Subscription
                              </SelectItem>
                              <SelectItem value="addon_payment">
                                Addon
                              </SelectItem>
                              <SelectItem value="setup_payment">
                                Setup
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.amount}
                            onChange={(e) =>
                              handleItemChange(item.id, "amount", e.target.value)
                            }
                            placeholder="0.00"
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Add Item Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          {/* Total */}
          <div className="border-t pt-4 flex justify-between items-center">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-2xl font-bold">${calculateTotal()}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
