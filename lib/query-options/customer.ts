import { mutationOptions, queryOptions } from "@tanstack/react-query"
import { createCustomer, getCustomer, listCustomer } from "../customer"

export const listCustomerOptions = (branch: string | null) => {
  return queryOptions({
    queryKey: ["listCustomer", branch],
    queryFn: () => listCustomer(branch!),
    refetchOnWindowFocus: false,
    enabled: !!branch,
  })
}

export const listSingleCustomerOptions = (
  customerId: string | null,
  branch: string | null
) => {
  return queryOptions({
    queryKey: ["listCustomer", customerId, branch],
    queryFn: () => getCustomer(customerId!, branch!),
    refetchOnWindowFocus: false,
    enabled: !!branch && !!customerId,
  })
}

export const createCustomerOptions = (branch: string) => {
  return mutationOptions({
    mutationKey: ["createCustomer", branch],
    mutationFn: (data) => {
      return createCustomer(data.customerData, branch!)
    },
  })
}
