import {
  listInvoiceOptions,
  listSingleInvoiceOptions,
  listOneInvoiceOptions,
  listTransactionOptions,
} from "@/lib/query-options/invoice"
import { useQueryClient } from "@tanstack/react-query"

type ParamType = {
  customerId?: string
  invoiceId?: string
  branch: string
}

export const invalidateAllInvoiceQueries = ({
  customerId,
  invoiceId,
  branch,
}: ParamType) => {
  const queryClient = useQueryClient()
  queryClient.invalidateQueries(listInvoiceOptions(branch))
  if (customerId)
    queryClient.invalidateQueries(listSingleInvoiceOptions(customerId, branch))

  if (invoiceId) {
    queryClient.invalidateQueries(listTransactionOptions(invoiceId, branch))
    queryClient.invalidateQueries(listOneInvoiceOptions(invoiceId, branch))
  }
}
