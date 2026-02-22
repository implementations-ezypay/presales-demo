import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const BackButton = ({
  resetMutationState,
}: {
  resetMutationState: () => void
}) => (
  <Button
    variant="ghost"
    size="icon"
    className="flex-shrink-0"
    onClick={resetMutationState}
  >
    <ArrowLeft className="h-4 w-4" />
  </Button>
)

export const CancelButton = () => (
  <Link href="/members" className="w-full sm:w-auto">
    <Button variant="outline" className="w-full bg-transparent" type="button">
      Cancel
    </Button>
  </Link>
)

export const CreateMemberButton = ({ isPending }: { isPending: boolean }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Creating...
            </>
          ) : (
            "Create Member"
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          It will simultanenously called Ezypay create customer API. Then,
          Ezypay payment method capture page is called with the customer ID
          returned from the API
        </p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)
