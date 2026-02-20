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
