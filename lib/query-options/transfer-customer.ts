import { mutationOptions, queryOptions } from "@tanstack/react-query"
import {
  createTransferRequest,
  listTransferRequests,
  updateTransferStatus,
} from "../transfer-customer"
import { processTransferApproval } from "../transfer-customer-actions"
import {
  CreateTransferCustomer,
  TransferCustomer,
} from "../types/transfer-customer"

export const listTransferRequestsOptions = (sourceBranch: string | null) => {
  return queryOptions({
    queryKey: ["listTransferRequests", sourceBranch],
    queryFn: () => listTransferRequests(sourceBranch!),
    refetchOnWindowFocus: false,
    enabled: !!sourceBranch,
  })
}

export const createTransferRequestOptions = () => {
  return mutationOptions({
    mutationKey: ["createTransferRequest"],
    mutationFn: (payload: CreateTransferCustomer) =>
      createTransferRequest(payload),
  })
}

export const approveTransferRequestOptions = () => {
  return mutationOptions({
    mutationKey: ["approveTransferRequest"],
    mutationFn: async (record: TransferCustomer) => {
      await processTransferApproval(record)
      return updateTransferStatus(record.id, "approved")
    },
  })
}

export const rejectTransferRequestOptions = () => {
  return mutationOptions({
    mutationKey: ["rejectTransferRequest"],
    mutationFn: (id: string) => updateTransferStatus(id, "rejected"),
  })
}
