import { useContext } from "react"
import { BranchContext } from "@/app/Provider"

export const useBranch = () => {
  const context = useContext(BranchContext)
  if (!context) {
    throw new Error("Context is not correctly configured for member page")
  }

  return context
}
