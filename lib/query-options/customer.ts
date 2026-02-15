import { queryOptions } from "@tanstack/react-query"
import { listCustomer } from "../customer"

export const listCustomerOptions = (branch: string) => {
  return queryOptions({
    queryKey: ["listCustomer", branch],
    queryFn: () => listCustomer(branch),
    refetchOnWindowFocus: false,
    enabled: !!branch,
  })
}
