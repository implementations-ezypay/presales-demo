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
  listOneInvocie,
} from "../invoice"
import { CheckoutInvoiceCreation, InvoiceCreation } from "../types/invoice"

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

export const listOneInvoiceOptions = (
  invoiceId: string | null,
  branch: string | null
) => {
  return queryOptions({
    queryKey: ["listOneInvoice", invoiceId, branch],
    queryFn: () => listOneInvocie(invoiceId!, branch!),
    refetchOnWindowFocus: false,
    enabled: !!branch && !!invoiceId,
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

export const listTransactionOptions = (
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
    mutationFn: (data: { invoiceData: CheckoutInvoiceCreation }) => {
      return createCheckout(data.invoiceData, branch)
    },
  })
}

type RetryInvoiceInput = {
  invoiceId: string
  paymentMethodToken: string
}

export const retryInvoiceOptions = (branch: string) => {
  return mutationOptions({
    mutationKey: ["retryInvoice", branch],
    mutationFn: (data: RetryInvoiceInput) => {
      return retryInvoice(data.invoiceId, data.paymentMethodToken, branch!)
    },
  })
}

type WriteOffInvoiceInput = {
  invoiceId: string
}

export const writeOffInvoiceOptions = (branch: string) => {
  return mutationOptions({
    mutationKey: ["writeOffInvoice", branch],
    mutationFn: (data: WriteOffInvoiceInput) => {
      return writeOffInvoice(data.invoiceId, branch!)
    },
  })
}

type RecordExternalInvoiceInput = {
  invoiceId: string
  method: string
}

export const recordExternalInvoiceOptions = (branch: string) => {
  return mutationOptions({
    mutationKey: ["recordExternalInvoice", branch],
    mutationFn: (data: RecordExternalInvoiceInput) => {
      return recordExternalInvoice(data.invoiceId, data.method, branch!)
    },
  })
}

type RefundInvoiceInput = {
  invoiceId: string
  amount?: number | null
}

export const refundInvoiceOptions = (branch: string) => {
  return mutationOptions({
    mutationKey: ["recordExternalInvoice", branch],
    mutationFn: (data: RefundInvoiceInput) => {
      return refundInvoice(data.invoiceId, data.amount, branch!)
    },
  })
}
