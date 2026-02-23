import { Amount } from "./invoice"

export type Settlement = {
  number: string
  date: string
  revenue: { value: number }
  deduction: { value: number }
  amount: Amount
  status: string
  failedSettlementReason: string
}

export type documentType = "tax_invoice" | "detail_report" | "summary_report"
