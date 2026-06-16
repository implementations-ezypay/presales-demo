"use server"

import {
  createCustomer,
  getCustomerPaymentMethods,
  listCustomer,
} from "./customer"
import { linkPaymentMethod } from "./payment-methods"
import { CreateCustomer } from "./types/customer"
import { TransferCustomer } from "./types/transfer-customer"

/**
 * Perform the actual customer transfer once a request is approved.
 *
 * Runs in the source branch context: looks up the customer in the source
 * branch by their Ezypay reference number, recreates them in the requesting
 * (destination) branch, and optionally links their existing payment methods.
 */
export async function processTransferApproval(
  record: TransferCustomer
): Promise<{ newCustomerId: string }> {
  // Find the customer in the source branch by their Ezypay reference number.
  const { data: matches } = await listCustomer(
    record.sourceBranch,
    record.ezypayReferenceNumber
  )

  const sourceCustomer = matches?.[0]
  if (!sourceCustomer) {
    throw new Error(
      `Customer ${record.ezypayReferenceNumber} not found in source branch`
    )
  }

  // Recreate the customer in the requesting (destination) branch.
  const { id: _id, ...rest } = sourceCustomer
  const newCustomerData: CreateCustomer = {
    ...rest,
    metadata: {
      ...sourceCustomer.metadata,
      originalBranch: record.sourceBranch,
      ...(record.amountRemaining != null
        ? { transferAmount: String(record.amountRemaining) }
        : {}),
    },
  }

  const newCustomer = await createCustomer(
    newCustomerData,
    record.branchRequestor
  )

  // Optionally transfer existing payment methods.
  if (record.transferPaymentMethods) {
    const { data: paymentMethods } = await getCustomerPaymentMethods(
      sourceCustomer.id,
      record.sourceBranch
    )

    for (const paymentMethod of paymentMethods ?? []) {
      await linkPaymentMethod(
        newCustomer.id,
        paymentMethod.paymentMethodToken,
        record.branchRequestor
      )
    }
  }

  return { newCustomerId: newCustomer.id }
}
