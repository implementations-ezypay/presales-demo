"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNewMemberContext } from "./utils"

export default function PersonalInformationCard() {
  const { handleInputChange } = useNewMemberContext()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base md:text-lg">
          Personal Information
        </CardTitle>
        <CardDescription className="text-sm">
          Basic member details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              First Name<span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              placeholder="John"
              required
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">
              Last Name<span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastName"
              placeholder="Doe"
              required
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email<span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              required
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobilePhone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+61 412 345 678"
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input id="dateOfBirth" type="date" onChange={handleInputChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            placeholder="123 Collins Street, Melbourne VIC 3000, Australia"
            onChange={handleInputChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emergencyContact">Emergency Contact</Label>
          <Input
            id="emergencyContact"
            placeholder="Jane Doe - +61 498 765 432"
            onChange={handleInputChange}
          />
        </div>
      </CardContent>
    </Card>
  )
}
