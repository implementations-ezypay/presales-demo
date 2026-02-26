import { PaymentMethod } from "./payment-method"

export type Invoice = {
  id: string
  amount: Amount
  customerId: string
  customerFirstName: string
  customerLastName: string
  documentNumber: string
  items: InvoiceItem[]
  manualRetryPossible: boolean
  payNowUrl?: string
  paymentMethodData: PaymentMethod
  paymentMethodInvalid: boolean
  paymentMethodToken: string
  qrData: { qrString: string; expired: string }
  status: string
  dueDate: string
  totalRefunded: Amount
  failedPaymentReason?: { code: string; description: string }
  paymentProviderResponse?: { code: string; description: string }
  scheduledPaymentDate?: string
  terminalId?: string
  createdOn: string
}

type InvoiceItem = {
  id: string
  description: string
  amount: Amount
  type?: string
  accountingCode?: string
}

export type Amount = {
  currency: string
  value: number
}

export type Transaction = {
  createdOn: string
  status: string
  amount: Amount
  id: string
  source: string
  paymentMethodType: string
  failedPaymentReason: { code: string; description: string }
}

export type InvoiceCreation = {
  customerId: string
  items: Omit<InvoiceItem, "id">[]
  paymentMethodToken: string
  externalInvoiceId?: string
  processingModel?: string
}

export type TerminalInvoiceCreation = Omit<
  InvoiceCreation,
  "paymentMethodToken"
> & { terminalId: string }

export type CheckoutInvoiceCreation = {
  customerId: string
  description: string
  amount: Amount
  paymentMethodToken?: string
  accountingCode?: string
}

export type CheckoutResponse = {
  checkoutUrl: string
  id: string
}
