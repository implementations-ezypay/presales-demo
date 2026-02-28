import { cn } from "@/lib/utils"

function Skeleton({
  className,
  isError = false,
  ...props
}: React.ComponentProps<"div"> & { isError?: boolean }) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        `bg-muted-foreground animate-pulse rounded-md ${isError ? "bg-destructive" : ""}`,
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
