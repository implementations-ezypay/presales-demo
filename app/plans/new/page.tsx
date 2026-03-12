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
