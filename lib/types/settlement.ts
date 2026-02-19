export type Settlement = {
  number: string
  date: string
  revenue: { value: number }
  deduction: { value: number }
  amount: { value: number }
  status: string
  failedSettlementReason: string
}
