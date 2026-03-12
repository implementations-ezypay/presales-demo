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
import { ArrowLeft, Plus, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function NewPlanPage() {
  const [features, setFeatures] = useState([""])
  const todayISO = new Date().toISOString().split("T")[0]
  const [startDate, setStartDate] = useState(todayISO)
  const [billingType, setBillingType] = useState<"day_of_month" | "day_of_week">("day_of_month")
  const [billingDayOfMonth, setBillingDayOfMonth] = useState("1")
  const [billingDayOfWeek, setBillingDayOfWeek] = useState("monday")
  const [firstBillingType, setFirstBillingType] = useState<"full" | "prorata" | "custom">("full")
  const [firstBillingCustomAmount, setFirstBillingCustomAmount] = useState("")

  const addFeature = () => {
    setFeatures([...features, ""])
  }

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features]
    newFeatures[index] = value
    setFeatures(newFeatures)
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/plans">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-balance">
                Create Membership Plan
              </h1>
              <p className="text-muted-foreground">
                Add a new membership plan to your gym
              </p>
            </div>
          </div>

          <form className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Plan Details</CardTitle>
                <CardDescription>
                  Basic information about the membership plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="planName">Plan Name</Label>
                  <Input
                    id="planName"
                    placeholder="e.g., Premium, Basic, Annual"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the plan"
                    rows={3}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input id="price" type="number" placeholder="99" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interval">Billing Interval</Label>
                    <Input id="interval" type="number" placeholder="2" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Interval Unit</Label>
                    <Select>
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
                        onChange={(e) => setFirstBillingCustomAmount(e.target.value)}
                        className="w-36 shrink-0"
                      />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {firstBillingType === "full" && "The first billing will charge the full plan amount."}
                    {firstBillingType === "prorata" && "The first billing will be calculated proportionally based on the start date within the billing cycle."}
                    {firstBillingType === "custom" && "Enter a specific amount to charge on the first billing."}
                  </p>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="popular">Mark as Popular</Label>
                    <p className="text-sm text-muted-foreground">
                      Display a "Most Popular" badge on this plan
                    </p>
                  </div>
                  <Switch id="popular" />
                </div>
              </CardContent>
            </Card>            

            <div className="flex justify-end gap-4">
              <Link href="/plans">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit">Create Plan</Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
