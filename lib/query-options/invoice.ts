import { mutationOptions, queryOptions } from "@tanstack/react-query"
import {
  createInvoice,
  listInvoice,
  listInvoiceByCustomer,
  listTransactionByInvoice,
  createCheckout,
  retryInvoice,
  writeOffInvoice,
  recordExternalInvoice,
  refundInvoice,
} from "../invoice"
import { InvoiceCreation } from "../types/invoice"

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

export const createInvoiceOptions = (branch: string) => {
  return mutationOptions({
    mutationKey: ["createInvoice", branch],
    mutationFn: (data: { invoiceData: InvoiceCreation }) => {
      return createInvoice(data.invoiceData, branch!)
    },
  })
}

export const createCheckoutOptions = (branch: string) => {
  return mutationOptions({
    mutationKey: ["createCheckout", branch],
    mutationFn: (data: { invoiceData: InvoiceCreation }) => {
      return createCheckout(data.invoiceData, branch!)
    },
  })
}

export const retryInvoiceOptions = (branch: string) => {
  return mutationOptions({
    mutationKey: ["retryInvoice", branch],
    mutationFn: (data) => {
      return retryInvoice(data.invoiceId, data.paymentMethodToken, branch!)
    },
  })
}

export const writeOffInvoiceOptions = (branch: string) => {
  return mutationOptions({
    mutationKey: ["writeOffInvoice", branch],
    mutationFn: (data) => {
      return writeOffInvoice(data.invoiceId, branch!)
    },
  })
}

export const recordExternalInvoiceOptions = (branch: string) => {
  return mutationOptions({
    mutationKey: ["recordExternalInvoice", branch],
    mutationFn: (data) => {
      return recordExternalInvoice(data.invoiceId, data.method, branch!)
    },
  })
}

export const refundInvoiceOptions = (branch: string) => {
  return mutationOptions({
    mutationKey: ["recordExternalInvoice", branch],
    mutationFn: (data) => {
      return refundInvoice(data.invoiceId, data.amount, branch!)
    },
  })
}
