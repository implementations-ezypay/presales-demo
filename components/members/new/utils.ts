import { NewMemberContext } from "@/app/members/new/page"
import { useContext } from "react"

export const useNewMemberContext = () => {
  const context = useContext(NewMemberContext)
  if (!context) {
    throw new Error("Context is not correctly configured for new member page")
  }

  return context
}
