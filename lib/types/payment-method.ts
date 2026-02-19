export type PaymentMethod = {
  paymentMethodToken: string
  customerId: string
  primary: boolean
  type: string
  valid: boolean
  card?: {
    last4: string
    type: string
    expiryMonth: string
    expiryYear: string
    origin: string | null
  }
  payTo?: {
    accountType: string
    bBanBSB?: string
    bBanAccountNo?: string
    mandateStatus: string
    mandateReason: string
    maximumPaymentAmount: number
    aliasId?: string
  }
  wallet?: {
    walletType: string
    accountId: string
  }
  bank?: {
    last4: string
  }
  qrPayment?: { qrType: string }
}
