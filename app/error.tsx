"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex w-full h-full justify-center items-center">
      <div className="flex w-[80%] h-full flex-col justify-center items-center">
        <h1 className="text-foreground text-2xl m-4">Unexpected error</h1>
        <Separator className="w-80" />
        <div className="m-4 text-lg mb-12">{error.message}</div>
        <Button
          variant={"ghost"}
          className="cursor-pointer text-lg"
          onClick={() => reset()}
        >
          Reset
        </Button>
      </div>
    </div>
  )
}
