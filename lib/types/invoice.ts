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
}

type InvoiceItem = {
  description: string
  amount: Amount
  type: string
  accountingCode: string
}

type Amount = {
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
