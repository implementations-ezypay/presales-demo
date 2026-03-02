"use server"

import axios from "axios"
import { logApiCall } from "./api-logger"
import { getBranchCredentials } from "./branch-config"
import { getEzypayToken } from "./ezypay-token"
import { PaymentMethod } from "./types/payment-method"
import { processError } from "./utils"

const apiEndpoint = `${process.env.API_ENDPOINT}/v2/billing/customers`
const mandateEndpoint = `${process.env.API_ENDPOINT}/v2/npp/mandate/status`
const vaultEndpoint = `${process.env.VAULT_ENDPOINT}/v2/vault`

export async function replacePaymentMethod(
  customerId: string,
  paymentMethodToken: string,
  newPaymentMethodToken: string,
  branch: string
): Promise<PaymentMethod> {
  const { merchantId } = await getBranchCredentials(branch)
  try {
    if (!customerId || !paymentMethodToken || !newPaymentMethodToken) {
      throw new Error("Not enough information")
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch)
    const token = tokenData.access_token

    const url = `${apiEndpoint}/${customerId}/paymentmethods/${paymentMethodToken}/new`
    const response = await axios.put<PaymentMethod>(
      url,
      { newPaymentMethodToken },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          merchant: merchantId,
          "Content-type": "application/json",
        },
      }
    )

    logApiCall("PUT", url, response.data, response.status, {
      newPaymentMethodToken,
    })

    return response.data
  } catch (err: unknown) {
    return processError("Replace Payment Method")(err)
  }
}

export async function deletePaymentMethod(
  customerId: string,
  paymentMethod: string,
  branch: string
): Promise<PaymentMethod> {
  const { merchantId } = await getBranchCredentials(branch)
  try {
    if (!customerId || !paymentMethod) {
      throw new Error("Not enough information")
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch)
    const token = tokenData.access_token

    const url = `${apiEndpoint}/${customerId}/paymentmethods/${paymentMethod}`
    const response = await axios.delete<PaymentMethod>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    const data = response.data
    logApiCall("DELETE", url, data, response.status)

    return data
  } catch (err: unknown) {
    return processError("Delete Payment Method")(err)
  }
}

export async function linkPaymentMethod(
  customerId: string,
  paymentMethod: string,
  branch: string
): Promise<PaymentMethod> {
  const { merchantId } = await getBranchCredentials(branch)
  try {
    if (!customerId || !paymentMethod) {
      throw new Error("Not enough information")
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch)
    const token = tokenData.access_token

    const url = `${apiEndpoint}/${customerId}/paymentmethods`
    const response = await axios.post<PaymentMethod>(
      url,
      { paymentMethodToken: paymentMethod },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          merchant: merchantId,
          "Content-type": "application/json",
        },
      }
    )

    const data = response.data
    logApiCall("POST", url, data, response.status, {
      paymentMethodToken: paymentMethod,
    })

    return data
  } catch (err: unknown) {
    return processError("Link Payment Method")(err)
  }
}

export async function activatePayTo(
  paymentMethodToken: string,
  branch: string,
  action: string
) {
  const { merchantId } = await getBranchCredentials(branch)
  try {
    if (!paymentMethodToken) {
      throw new Error("Payment method token is required")
    }

    // Get token directly from utility function
    const tokenData = await getEzypayToken(branch)
    const token = tokenData.access_token

    const body = new URLSearchParams()

    if (action === "authorise") {
      body.append("mandateStatus", "ACTV")
    } else {
      body.append("mandateStatus", "CNCD")
    }

    const url = `${mandateEndpoint}/${paymentMethodToken}/mock`
    const response = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })

    logApiCall("POST", url, "", response.status, Object.fromEntries(body))

    return ""
  } catch (err: unknown) {
    return processError("Activate PayTo")(err)
  }
}

export async function createPromptPay(
  customerId: string,
  branch: string
): Promise<PaymentMethod> {
  const { merchantId } = await getBranchCredentials(branch)
  try {
    if (!customerId) {
      throw new Error("Missing customer ID")
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch)
    const token = tokenData.access_token

    const body = {
      accountHolderName: "customer",
      countryCode: "TH",
      qrType: "PROMPTPAY",
      termAndConditionAgreed: true,
      customerId,
    }

    const url = `${vaultEndpoint}/paymentmethodtokens/qrpayment`
    const response = await axios.post<PaymentMethod>(url, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
        "Content-type": "application/json",
      },
    })

    const data = response.data
    logApiCall("POST", url, data, response.status, body)

    return data
  } catch (err: unknown) {
    return processError("Create PromptPay")(err)
  }
}
