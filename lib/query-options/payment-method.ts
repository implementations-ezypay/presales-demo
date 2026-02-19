import { queryOptions } from "@tanstack/react-query"
import { getCustomerPaymentMethods } from "../customer"

export const getCustomerPaymentMethodsOptions = (
  customerId: string | null,
  branch: string | null
) => {
  return queryOptions({
    queryKey: ["getCustomerPaymentMethods", customerId, branch],
    queryFn: () => getCustomerPaymentMethods(customerId!, branch!),
    refetchOnWindowFocus: false,
    enabled: !!branch && !!customerId,
  })
}
