import { queryOptions } from "@tanstack/react-query"
import {
  listInvoice,
  listInvoiceByCustomer,
  listTransactionByInvoice,
} from "../invoice"

export const listSingleInvoiceOptions = (
  customerId: string | null,
  branch: string | null
) => {
  return queryOptions({
    queryKey: ["listSingleInvoice", customerId, branch],
    queryFn: () => listInvoiceByCustomer(customerId!, branch!),
    refetchOnWindowFocus: false,
    enabled: !!branch && !!customerId,
  })
}

export const listInvoiceOptions = (branch: string | null) => {
  return queryOptions({
    queryKey: ["listInvoice", branch],
    queryFn: () => listInvoice(branch!),
    refetchOnWindowFocus: false,
    enabled: !!branch,
  })
}

export const listTransaction = (
  invoiceId: string | undefined,
  branch: string
) => {
  return queryOptions({
    queryKey: ["listTransaction", invoiceId, branch],
    queryFn: () => listTransactionByInvoice(invoiceId!, branch!),
    refetchOnWindowFocus: false,
    enabled: !!branch && !!invoiceId,
  })
}
