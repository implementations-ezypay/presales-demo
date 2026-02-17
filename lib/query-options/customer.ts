import { queryOptions } from "@tanstack/react-query"
import { listCustomer } from "../customer"
import { Branch } from "../types/banch"

export const listCustomerOptions = (branch: Branch | null) => {
  return queryOptions({
    queryKey: ["listCustomer", branch],
    queryFn: () => listCustomer(branch!),
    refetchOnWindowFocus: false,
    enabled: !!branch,
  })
}
