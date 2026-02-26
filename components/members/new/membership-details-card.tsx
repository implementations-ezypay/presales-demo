import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { plans } from "@/lib/plan"
import { useNewMemberContext } from "./utils"

export const MemberShipDetailsCard = () => {
  const { formData, handleInputChange, handleSelectChange } =
    useNewMemberContext()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base md:text-lg">
          Membership Details
        </CardTitle>
        <CardDescription className="text-sm">
          Select membership plan and start date
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="plan">Membership Plan</Label>
          <Select
            onValueChange={(value) => handleSelectChange("plan", value)}
            value={formData.plan ?? undefined}
          >
            <SelectTrigger id="plan">
              <SelectValue placeholder="Select a plan" />
            </SelectTrigger>
            <SelectContent>
              {plans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id.toLowerCase()}>
                  {plan.name} - ${plan.price}/{plan.duration}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input id="startDate" type="date" onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              onValueChange={(value) => handleSelectChange("status", value)}
              value={formData.status}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
