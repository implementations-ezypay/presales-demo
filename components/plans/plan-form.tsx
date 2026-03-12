"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useState, useEffect } from "react"

export type PlanFormData = {
  planName: string
  description: string
  price: string
  interval: string
  intervalUnit: string
  startDate: string
  billingType: "day_of_month" | "day_of_week"
  billingDayOfMonth: string
  billingDayOfWeek: string
  firstBillingType: "full" | "prorata" | "custom"
  firstBillingCustomAmount: string
  planEndType: "ongoing" | "end_date" | "amount_collected"
  planEndDate: string
  planEndAmount: string
  isPopular: boolean
}

type PlanFormProps = {
  initialData?: Partial<PlanFormData>
  onSubmit: (data: PlanFormData) => void
  submitLabel: string
}

export default function PlanForm({
  initialData,
  onSubmit,
  submitLabel,
}: PlanFormProps) {
  const todayISO = new Date().toISOString().split("T")[0]

  const [planName, setPlanName] = useState(initialData?.planName || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [price, setPrice] = useState(initialData?.price || "")
  const [interval, setInterval] = useState(initialData?.interval || "")
  const [intervalUnit, setIntervalUnit] = useState(
    initialData?.intervalUnit || ""
  )
  const [startDate, setStartDate] = useState(
    initialData?.startDate || todayISO
  )
  const [billingType, setBillingType] = useState<"day_of_month" | "day_of_week">(
    initialData?.billingType || "day_of_month"
  )
  const [billingDayOfMonth, setBillingDayOfMonth] = useState(
    initialData?.billingDayOfMonth || "1"
  )
  const [billingDayOfWeek, setBillingDayOfWeek] = useState(
    initialData?.billingDayOfWeek || "monday"
  )
  const [firstBillingType, setFirstBillingType] = useState<
    "full" | "prorata" | "custom"
  >(initialData?.firstBillingType || "full")
  const [firstBillingCustomAmount, setFirstBillingCustomAmount] = useState(
    initialData?.firstBillingCustomAmount || ""
  )
  const [planEndType, setPlanEndType] = useState<
    "ongoing" | "end_date" | "amount_collected"
  >(initialData?.planEndType || "ongoing")
  const [planEndDate, setPlanEndDate] = useState(initialData?.planEndDate || "")
  const [planEndAmount, setPlanEndAmount] = useState(
    initialData?.planEndAmount || ""
  )
  const [isPopular, setIsPopular] = useState(initialData?.isPopular || false)

  // Update state when initialData changes
  useEffect(() => {
    if (initialData) {
      if (initialData.planName !== undefined) setPlanName(initialData.planName)
      if (initialData.description !== undefined)
        setDescription(initialData.description)
      if (initialData.price !== undefined) setPrice(initialData.price)
      if (initialData.interval !== undefined) setInterval(initialData.interval)
      if (initialData.intervalUnit !== undefined)
        setIntervalUnit(initialData.intervalUnit)
      if (initialData.startDate !== undefined)
        setStartDate(initialData.startDate)
      if (initialData.billingType !== undefined)
        setBillingType(initialData.billingType)
      if (initialData.billingDayOfMonth !== undefined)
        setBillingDayOfMonth(initialData.billingDayOfMonth)
      if (initialData.billingDayOfWeek !== undefined)
        setBillingDayOfWeek(initialData.billingDayOfWeek)
      if (initialData.firstBillingType !== undefined)
        setFirstBillingType(initialData.firstBillingType)
      if (initialData.firstBillingCustomAmount !== undefined)
        setFirstBillingCustomAmount(initialData.firstBillingCustomAmount)
      if (initialData.planEndType !== undefined)
        setPlanEndType(initialData.planEndType)
      if (initialData.planEndDate !== undefined)
        setPlanEndDate(initialData.planEndDate)
      if (initialData.planEndAmount !== undefined)
        setPlanEndAmount(initialData.planEndAmount)
      if (initialData.isPopular !== undefined)
        setIsPopular(initialData.isPopular)
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      planName,
      description,
      price,
      interval,
      intervalUnit,
      startDate,
      billingType,
      billingDayOfMonth,
      billingDayOfWeek,
      firstBillingType,
      firstBillingCustomAmount,
      planEndType,
      planEndDate,
      planEndAmount,
      isPopular,
    })
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Plan Details</CardTitle>
          <CardDescription>
            Basic information about the membership plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="planName">Plan Name</Label>
              <Input
                id="planName"
                placeholder="e.g., Premium, Basic, Annual"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>First Billing Amount</Label>
              <div className="flex gap-2">
                <Select
                  value={firstBillingType}
                  onValueChange={(v) =>
                    setFirstBillingType(v as "full" | "prorata" | "custom")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full amount</SelectItem>
                    <SelectItem value="prorata">Pro-rata amount</SelectItem>
                    <SelectItem value="custom">Custom amount</SelectItem>
                  </SelectContent>
                </Select>
                {firstBillingType === "custom" && (
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={firstBillingCustomAmount}
                    onChange={(e) =>
                      setFirstBillingCustomAmount(e.target.value)
                    }
                    className="w-36 shrink-0"
                  />
                )}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the plan"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                placeholder="99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interval">Billing Interval</Label>
              <Input
                id="interval"
                type="number"
                placeholder="2"
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Interval Unit</Label>
              <Select value={intervalUnit} onValueChange={setIntervalUnit}>
                <SelectTrigger id="interval_unit">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                min={todayISO}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Must be today or a future date.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Billing Date</Label>
              <div className="flex gap-2">
                <Select
                  value={billingType}
                  onValueChange={(v) =>
                    setBillingType(v as "day_of_month" | "day_of_week")
                  }
                >
                  <SelectTrigger className="w-[160px] shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day_of_month">Day of month</SelectItem>
                    <SelectItem value="day_of_week">Day of week</SelectItem>
                  </SelectContent>
                </Select>
                {billingType === "day_of_month" ? (
                  <Select
                    value={billingDayOfMonth}
                    onValueChange={setBillingDayOfMonth}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Day" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <SelectItem key={d} value={String(d)}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select
                    value={billingDayOfWeek}
                    onValueChange={setBillingDayOfWeek}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monday">Monday</SelectItem>
                      <SelectItem value="tuesday">Tuesday</SelectItem>
                      <SelectItem value="wednesday">Wednesday</SelectItem>
                      <SelectItem value="thursday">Thursday</SelectItem>
                      <SelectItem value="friday">Friday</SelectItem>
                      <SelectItem value="saturday">Saturday</SelectItem>
                      <SelectItem value="sunday">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                The recurring day billing is charged each cycle.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Plan End</Label>
            <div className="flex gap-2">
              <Select
                value={planEndType}
                onValueChange={(v) =>
                  setPlanEndType(v as "ongoing" | "end_date" | "amount_collected")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="end_date">Specific end date</SelectItem>
                  <SelectItem value="amount_collected">
                    After amount collected
                  </SelectItem>
                </SelectContent>
              </Select>
              {planEndType === "end_date" && (
                <Input
                  type="date"
                  min={startDate}
                  value={planEndDate}
                  onChange={(e) => setPlanEndDate(e.target.value)}
                  className="w-40 shrink-0"
                />
              )}
              {planEndType === "amount_collected" && (
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={planEndAmount}
                  onChange={(e) => setPlanEndAmount(e.target.value)}
                  className="w-36 shrink-0"
                />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {planEndType === "ongoing" &&
                "This plan will continue indefinitely until manually cancelled."}
              {planEndType === "end_date" &&
                "This plan will automatically end on the specified date."}
              {planEndType === "amount_collected" &&
                "This plan will end after the total specified amount has been collected."}
            </p>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="popular">Mark as Popular</Label>
              <p className="text-sm text-muted-foreground">
                Display a "Most Popular" badge on this plan
              </p>
            </div>
            <Switch
              id="popular"
              checked={isPopular}
              onCheckedChange={setIsPopular}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" asChild>
          <a href="/plans">Cancel</a>
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  )
}
