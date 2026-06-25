export type TransferCustomerStatus = "requested" | "approved" | "rejected"

export type TransferCustomer = {
  id: string
  /** Branch that is requesting the transfer (destination) */
  branchRequestor: string
  /** Branch the customer currently belongs to (source) */
  sourceBranch: string
  /** Ezypay reference number of the current customer */
  ezypayReferenceNumber: string
  /** Amount remaining for full payment */
  amountRemaining?: number | null
  /** Whether to transfer existing payment methods */
  transferPaymentMethods: boolean
  /** Whether to mark the source customer inactive once transferred */
  inactivateSource: boolean
  /** Transfer process status */
  status: TransferCustomerStatus
  createdAt: string
  updatedAt: string
}

export type CreateTransferCustomer = {
  branchRequestor: string
  sourceBranch: string
  ezypayReferenceNumber: string
  amountRemaining?: number | null
  transferPaymentMethods: boolean
  inactivateSource: boolean
}

/** Shape of a row as stored in the database (snake_case columns). */
export type TransferCustomerRow = {
  id: string
  branch_requestor: string
  source_branch: string
  ezypay_reference_number: string
  amount_remaining: number | null
  transfer_payment_methods: boolean
  inactivate_source: boolean
  status: TransferCustomerStatus
  created_at: string
  updated_at: string
}

export function mapTransferCustomerRow(
  row: TransferCustomerRow
): TransferCustomer {
  return {
    id: row.id,
    branchRequestor: row.branch_requestor,
    sourceBranch: row.source_branch,
    ezypayReferenceNumber: row.ezypay_reference_number,
    amountRemaining: row.amount_remaining,
    transferPaymentMethods: row.transfer_payment_methods,
    inactivateSource: row.inactivate_source,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
