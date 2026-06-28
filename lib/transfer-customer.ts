import { createClient } from "@/lib/supabase/client"
import {
  CreateTransferCustomer,
  mapTransferCustomerRow,
  TransferCustomer,
  TransferCustomerRow,
  TransferCustomerStatus,
} from "@/lib/types/transfer-customer"

/**
 * Insert a new customer transfer request.
 * The request is recorded against the source branch for approval.
 */
export async function createTransferRequest(
  payload: CreateTransferCustomer
): Promise<TransferCustomer> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("transfer_customer")
    .insert({
      branch_requestor: payload.branchRequestor,
      source_branch: payload.sourceBranch,
      ezypay_reference_number: payload.ezypayReferenceNumber,
      amount_remaining: payload.amountRemaining ?? null,
      transfer_payment_methods: payload.transferPaymentMethods,
    })
    .select("*")
    .single()

  if (error) throw new Error(error.message)
  return mapTransferCustomerRow(data as TransferCustomerRow)
}

/**
 * List transfer requests recorded against a given source branch.
 * Used by the source branch to review and approve pending transfers.
 */
export async function listTransferRequests(
  sourceBranch: string
): Promise<TransferCustomer[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("transfer_customer")
    .select("*")
    .eq("source_branch", sourceBranch)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data as TransferCustomerRow[]).map(mapTransferCustomerRow)
}

/**
 * List transfer requests raised BY a given branch (as the requestor).
 * Used by the requesting branch to track the outcome of its requests,
 * e.g. to see which transfers were rejected by the source branch.
 */
export async function listTransferRequestsByRequestor(
  branchRequestor: string
): Promise<TransferCustomer[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("transfer_customer")
    .select("*")
    .eq("branch_requestor", branchRequestor)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data as TransferCustomerRow[]).map(mapTransferCustomerRow)
}

/** Update the status of a transfer request (e.g. approved / rejected). */
export async function updateTransferStatus(
  id: string,
  status: TransferCustomerStatus
): Promise<TransferCustomer> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("transfer_customer")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single()

  if (error) throw new Error(error.message)
  return mapTransferCustomerRow(data as TransferCustomerRow)
}
