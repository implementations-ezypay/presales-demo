"use server"

import axios, { AxiosResponse } from "axios"
import { getEzypayToken } from "./ezypay-token"
import { logApiCall } from "./api-logger"
import { getBranchCredentials } from "./branch-config"
import { PaymentMethod } from "./types/payment-method"

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
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(
        `Replace Payment Method failed: No access_token from token utility`
      )
    }

    const url = `${apiEndpoint}/${customerId}/paymentmethods/${paymentMethodToken}/new`
    const response: AxiosResponse<PaymentMethod> = await axios.put(
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

    await logApiCall("PUT", url, response.data, response.status, {
      newPaymentMethodToken,
    })

    return response.data
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        "Replace Payment Method failed:",
        err.response?.data || err.message
      )
      throw new Error(`Replace Payment Method failed: ${err.message}`, {
        cause: err,
      })
    }
    if (err instanceof Error) {
      console.error("Replace Payment Method failed error:", err)
      throw err
    }
    console.error("Replace Payment Method failed error:", err)
    throw new Error(`Replace Payment Method failed: unknown error`, {
      cause: err,
    })
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
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(
        `Delete Payment Method failed: No access_token from token utility`
      )
    }

    const url = `${apiEndpoint}/${customerId}/paymentmethods/${paymentMethod}`
    const response: AxiosResponse<PaymentMethod> = await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    const data = response.data
    await logApiCall("DELETE", url, data, response.status)

    return data
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        "Delete Payment Method failed:",
        err.response?.data || err.message
      )
      throw new Error(`Delete Payment Method failed: ${err.message}`, {
        cause: err,
      })
    }
    if (err instanceof Error) {
      console.error("Delete Payment Method failed error:", err)
      throw err
    }
    console.error("Delete Payment Method failed error:", err)
    throw new Error(`Delete Payment Method failed: unknown error`, {
      cause: err,
    })
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
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(
        `Link Payment Method failed: No access_token from token utility`
      )
    }

    const url = `${apiEndpoint}/${customerId}/paymentmethods`
    const response: AxiosResponse<PaymentMethod> = await axios.post(
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
    await logApiCall("POST", url, data, response.status, {
      paymentMethodToken: paymentMethod,
    })

    return data
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        "Link Payment Method failed:",
        err.response?.data || err.message
      )
      throw new Error(`Link Payment Method failed: ${err.message}`, {
        cause: err,
      })
    }
    if (err instanceof Error) {
      console.error("Link Payment Method failed error:", err)
      throw err
    }
    console.error("Link Payment Method failed error:", err)
    throw new Error(`Link Payment Method failed: unknown error`, {
      cause: err,
    })
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
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(
        `Activate PayTo failed: No access_token from token utility`
      )
    }

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

    await logApiCall("POST", url, "", response.status, Object.fromEntries(body))

    return ""
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        "Update PayTo Agreement failed:",
        err.response?.data || err.message
      )
      throw new Error(`Update PayTo Agreement failed: ${err.message}`, {
        cause: err,
      })
    }
    if (err instanceof Error) {
      console.error("Update PayTo Agreement failed error:", err)
      throw err
    }
    console.error("Update PayTo Agreement error:", err)
    throw new Error(`Update PayTo Agreement: unknown error`, {
      cause: err,
    })
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
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(
        `Create PromptPay Token failed: No access_token from token utility`
      )
    }

    const body = {
      accountHolderName: "customer",
      countryCode: "TH",
      qrType: "PROMPTPAY",
      termAndConditionAgreed: true,
      customerId,
    }

    const url = `${vaultEndpoint}/paymentmethodtokens/qrpayment`
    const response: AxiosResponse<PaymentMethod> = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
        "Content-type": "application/json",
      },
    })

    const data = response.data
    await logApiCall("POST", url, data, response.status, body)

    return data
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        "Create PromptPay failed:",
        err.response?.data || err.message
      )
      throw new Error(`Create PromptPay failed: ${err.message}`, {
        cause: err,
      })
    }
    if (err instanceof Error) {
      console.error("Create PromptPay failed error:", err)
      throw err
    }
    console.error("Create PromptPay failed error:", err)
    throw new Error(`Create PromptPay failed: unknown error`, {
      cause: err,
    })
  }
}
