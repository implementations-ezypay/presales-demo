"use client"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

const description = {
  something: "can it render object?",
  longer: "can it render object?",
  andLonger: "can it render object?",
}

export default async function ToastTester() {
  console.log(JSON.stringify(description, null, 2))
  const handleToast = () => {
    toast("test toast", {
      description: (
        <div>
          <Separator className="mt-3" />
          <pre>
            {JSON.stringify(description, null, 2).replaceAll(/^{|}$/gi, "")}
          </pre>
        </div>
      ),
      closeButton: true,
      dismissible: false,
    })
  }
  return <Button onClick={handleToast}>toast</Button>
}
