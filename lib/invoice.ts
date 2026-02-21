"use server"

import axios, { AxiosResponse } from "axios"
import { getEzypayToken } from "./ezypay-token"
import { logApiCall } from "./api-logger"
import { getBranchCredentials } from "./branch-config"
import { randomUUID } from "node:crypto"
import {
  CheckoutInvoiceCreation,
  CheckoutResponse,
  Invoice,
  InvoiceCreation,
  Transaction,
} from "./types/invoice"

const apiEndpoint = `${process.env.API_ENDPOINT}/v2/billing/invoices`
const checkoutEndpoint = `${process.env.API_ENDPOINT}/v2/billing/checkout`
const transactionEndpoint = `${process.env.API_ENDPOINT}/v2/billing/transactions`

export async function listInvoice(
  branch: string
): Promise<{ data: Invoice[] }> {
  const { merchantId } = await getBranchCredentials(branch)
  try {
    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch)
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(`List Invoice failed: No access_token from token utility`)
    }

    const url = `${apiEndpoint}?limit=50`
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    return response.data
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("List invoice error:", err.response?.data || err.message)
      throw new Error(`List invoice failed: ${err.message}`, {
        cause: err,
      })
    }
    if (err instanceof Error) {
      console.error("List invoice error:", err)
      throw err
    }

    console.error("List invoice error:", err)
    throw new Error(`List invoice failed: unknown error`, {
      cause: err,
    })
  }
}

export async function listInvoiceByCustomer(
  customerId: string,
  branch: string
): Promise<{ data: Invoice[] }> {
  const { merchantId } = await getBranchCredentials(branch)
  try {
    if (!customerId) {
      throw new Error("No customer ID")
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch)
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(
        `List customer failed: No access_token from token utility`
      )
    }

    const url = `${apiEndpoint}?customerId=${customerId}&limit=30`
    const response: AxiosResponse<{ data: Invoice[] }> = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    return response.data
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        "List Customer invoice error:",
        err.response?.data || err.message
      )
      throw new Error(`List Customer invoice failed: ${err.message}`, {
        cause: err,
      })
    }
    if (err instanceof Error) {
      console.error("List Customer invoice error:", err)
      throw err
    }
    console.error("List Customer invoice error:", err)
    throw new Error(`List Customer invoice failed: Unknown error`, {
      cause: err,
    })
  }
}

export async function listTransactionByInvoice(
  invoiceId: string,
  branch: string
): Promise<{ data: Transaction[] }> {
  const { merchantId } = await getBranchCredentials(branch)
  try {
    if (!invoiceId) {
      throw new Error("No invoice ID")
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch)
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(
        `List customer failed: No access_token from token utility`
      )
    }

    const url = `${transactionEndpoint}?documentId=${invoiceId}&limit=10`
    const response: AxiosResponse<{ data: Transaction[] }> = await axios.get(
      url,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          merchant: merchantId,
        },
      }
    )

    return response.data
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        "List transaction error:",
        err.response?.data || err.message
      )
      throw new Error(`List transaction failed: ${err.message}`, {
        cause: err,
      })
    }
    if (err instanceof Error) {
      console.error("List transaction error:", err)
      throw err
    }
    console.error("List transaction error:", err)
    throw new Error(`List transaction failed: Unknown error`, { cause: err })
  }
}

export async function retryInvoice(
  invoiceId: string,
  paymentMethodId: string,
  branch: string
): Promise<Invoice> {
  const { merchantId } = await getBranchCredentials(branch)
  try {
    if (!invoiceId) {
      throw new Error("No invoice ID")
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch)
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(
        `List customer failed: No access_token from token utility`
      )
    }

    const requestBody = {
      paymentMethodToken: paymentMethodId,
      oneOff: true,
    }

    const url = `${apiEndpoint}/${invoiceId}/retrypayment`
    const response: AxiosResponse<Invoice> = await axios.post(
      url,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          merchant: merchantId,
          "Content-type": "application/json",
        },
      }
    )

    const data = response.data
    await logApiCall("POST", url, data, response.status, requestBody)

    return data
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("Retry Invoice failed:", err.response?.data || err.message)
      throw new Error(`Retry invoice failed: ${err.message}`, {
        cause: err,
      })
    }
    if (err instanceof Error) {
      console.error("Retry Invoice failed error:", err)
      throw err
    }
    console.error("Retry Invoice failed error:", err)
    throw new Error(`Retry invoice failed: Unknown error`, { cause: err })
  }
}

export async function writeOffInvoice(
  invoiceId: string,
  branch: string
): Promise<Invoice> {
  const { merchantId } = await getBranchCredentials(branch)
  try {
    if (!invoiceId) {
      throw new Error("No invoice ID")
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch)
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(`Write off failed: No access_token from token utility`)
    }

    const url = `${apiEndpoint}/${invoiceId}/writeoff`
    const response: AxiosResponse<Invoice> = await axios.post(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          merchant: merchantId,
          "Content-type": "application/json",
        },
      }
    )

    const data = response.data
    await logApiCall("POST", url, data, response.status, {})

    return data
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        "Write off Invoice failed:",
        err.response?.data || err.message
      )
      throw new Error(`Write off invoice failed: ${err.message}`, {
        cause: err,
      })
    }
    if (err instanceof Error) {
      console.error("Write off Invoice failed error:", err)
      throw err
    }
    console.error("Write off Invoice failed error:", err)
    throw new Error(`Write off invoice failed: Unknown error`, { cause: err })
  }
}

export async function recordExternalInvoice(
  invoiceId: string,
  method: string,
  branch: string
): Promise<Invoice> {
  const { merchantId } = await getBranchCredentials(branch)
  try {
    if (!invoiceId) {
      throw new Error("No invoice ID")
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch)
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(
        `List customer failed: No access_token from token utility`
      )
    }

    const requestBody = { paymentMethodType: method }

    const url = `${apiEndpoint}/${invoiceId}/recordpayment`
    const response: AxiosResponse<Invoice> = await axios.post(
      url,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          merchant: merchantId,
          "Content-type": "application/json",
        },
      }
    )

    const data = response.data
    await logApiCall("POST", url, data, response.status, requestBody)

    return data
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        "Record External Invoice failed:",
        err.response?.data || err.message
      )
      throw new Error(`Record External invoice failed: ${err.message}`, {
        cause: err,
      })
    }
    if (err instanceof Error) {
      console.error("Record External Invoice failed error:", err)
      throw err
    }
    console.error("Record External Invoice failed error:", err)
    throw new Error(`Record External invoice failed: Unknown error`, {
      cause: err,
    })
  }
}

export async function refundInvoice(
  invoiceId: string,
  amount: number | null = null,
  branch: string
): Promise<Invoice> {
  const { merchantId } = await getBranchCredentials(branch)
  try {
    if (!invoiceId) {
      throw new Error("No invoice ID")
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch)
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(`Refund failed: No access_token from token utility`)
    }

    const requestBody = amount ? { amount: amount } : {}

    const url = `${apiEndpoint}/${invoiceId}/refund`
    const response: AxiosResponse<Invoice> = await axios.put(url, requestBody, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
        "Content-type": "application/json",
      },
    })

    const data = response.data
    await logApiCall("PUT", url, data, response.status, requestBody)

    return data
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("Refund Invoice failed:", err.response?.data || err.message)
      throw new Error(`Refund invoice failed: ${err.message}`, {
        cause: err,
      })
    }
    if (err instanceof Error) {
      console.error("Refund Invoice failed error:", err)
      throw err
    }
    console.error("Refund Invoice failed error:", err)
    throw new Error(`Refund invoice failed: Unknown error`, {
      cause: err,
    })
  }
}

export async function createInvoice(
  invoiceData: InvoiceCreation,
  branch: string
): Promise<Invoice> {
  const { merchantId } = await getBranchCredentials(branch)
  try {
    if (!invoiceData) {
      throw new Error("No invoice Data")
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch)
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(
        `Create invoice failed: No access_token from token utility`
      )
    }

    const requestBody: InvoiceCreation = {
      ...invoiceData,
      externalInvoiceId: randomUUID(),
      processingModel: "cardonfile",
    }

    const response: AxiosResponse<Invoice> = await axios.post(
      apiEndpoint,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          merchant: merchantId,
          "Content-type": "application/json",
        },
      }
    )

    const data = response.data
    await logApiCall("POST", apiEndpoint, data, response.status, requestBody)

    return data
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("Create Invoice failed:", err.response?.data || err.message)
      throw new Error(`Create invoice failed: ${err.message}`, {
        cause: err,
      })
    }
    if (err instanceof Error) {
      console.error("Create Invoice failed error:", err)
      throw err
    }
    console.error("Create Invoice failed error:", err)
    throw new Error(`Create invoice failed: Unknown error`, { cause: err })
  }
}

export async function createCheckout(
  invoiceData: CheckoutInvoiceCreation,
  branch: string
): Promise<CheckoutResponse> {
  const { merchantId } = await getBranchCredentials(branch)
  try {
    if (!invoiceData) {
      throw new Error("No invoice data for checkout session")
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch)
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(
        `Checkout session failed: No access_token from token utility`
      )
    }

    const response: AxiosResponse<CheckoutResponse> = await axios.post(
      checkoutEndpoint,
      invoiceData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          merchant: merchantId,
          "Content-type": "application/json",
        },
      }
    )

    const data = response.data
    await logApiCall(
      "POST",
      checkoutEndpoint,
      data,
      response.status,
      invoiceData
    )

    return data
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        "Create Checkout failed:",
        err.response?.data || err.message
      )
      throw new Error(`Create Checkout failed: ${err.message}`, {
        cause: err,
      })
    }
    if (err instanceof Error) {
      console.error("Create Checkout failed error:", err)
      throw err
    }
    console.error("Create Checkout failed error:", err)
    throw new Error(`Create Checkout failed: Unknown error`, {
      cause: err,
    })
  }
}
