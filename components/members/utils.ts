import { useContext } from "react"
import { MemberContext } from "./member-context-provider"

export const useMember = () => {
  const context = useContext(MemberContext)
  if (!context) {
    throw new Error("Context is not correctly configured for member page")
  }

  return context
}
