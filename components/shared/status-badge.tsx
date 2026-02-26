import { getStatusBadgeVariant } from "@/lib/utils"
import { Badge } from "../ui/badge"
import { ComponentProps } from "react"

export const StatusBadge = ({
  status,
  className,
  ...props
}: {
  status: string
  className?: string
  props?: ComponentProps<"span">
}) => (
  <Badge
    variant={getStatusBadgeVariant(status)}
    {...props}
    className={className}
  >
    {status}
  </Badge>
)
