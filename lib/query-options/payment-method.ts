import { mutationOptions, queryOptions } from "@tanstack/react-query"
import { getCustomerPaymentMethods } from "../customer"
import {
  activatePayTo,
  createPromptPay,
  deletePaymentMethod,
  linkPaymentMethod,
  replacePaymentMethod,
} from "../payment-methods"
import { getEzypayToken } from "../ezypay-token"

export const getCustomerPaymentMethodsOptions = (
  customerId: string | null,
  branch: string | null
) => {
  return queryOptions({
    queryKey: ["getCustomerPaymentMethods", customerId, branch],
    queryFn: () => getCustomerPaymentMethods(customerId!, branch!),
    refetchOnWindowFocus: false,
    enabled: !!branch && !!customerId,
  })
}

type ReplacePaymentMethodInput = {
  paymentMethodToken: string
  newPaymentMethodToken: string
}

export const replacePaymentMethodOptions = (
  customerId: string | null,
  branch: string | null
) => {
  return mutationOptions({
    mutationKey: ["replacePaymentMethod", customerId, branch],
    mutationFn: (data: ReplacePaymentMethodInput) => {
      return replacePaymentMethod(
        customerId,
        data.paymentMethodToken,
        data.newPaymentMethodToken,
        branch
      )
    },
  })
}

export const deletePaymentMethodOptions = (
  customerId: string | null,
  branch: string | null
) => {
  return mutationOptions({
    mutationKey: ["deletePaymentMethod", customerId, branch],
    mutationFn: (data: { paymentMethodToken: string }) => {
      return deletePaymentMethod(customerId, data.paymentMethodToken, branch)
    },
  })
}

type UpdatePayToStatusInput = {
  paymentMethodToken: string
  action: "authorise" | "decline"
}

export const updatePayToStatusOptions = (branch: string) => {
  return mutationOptions({
    mutationKey: ["updatePayToStatus", branch],
    mutationFn: (data: UpdatePayToStatusInput) => {
      return activatePayTo(data.paymentMethodToken, branch, data.action)
    },
  })
}

export const getTokenOptions = (branch: string) => {
  return mutationOptions({
    mutationKey: ["getToken", branch],
    mutationFn: (data) => {
      return getEzypayToken(branch)
    },
  })
}

export const linkPaymentMethodOptions = (branch: string) => {
  return mutationOptions({
    mutationKey: ["linkPaymentMethod", branch],
    mutationFn: (data) => {
      return linkPaymentMethod(data.customerId, data.paymentMethodToken, branch)
    },
  })
}

export const createPromptPayOptions = (branch: string) => {
  return mutationOptions({
    mutationKey: ["createPromptPay", branch],
    mutationFn: (data) => {
      return createPromptPay(data.customerId, branch)
    },
  })
}
