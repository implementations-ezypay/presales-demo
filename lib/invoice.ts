"use server"

import { getEzypayToken } from "./ezypay-token"
import { logApiCall } from "./api-logger"
import { getBranchCredentials } from "./branch-config"
import { getBranchCurrency } from "./branches"
import { randomUUID } from "node:crypto"
import { InvoiceCreation, Transaction } from "./types/invoice"

const apiEndpoint = `${process.env.API_ENDPOINT}/v2/billing/invoices`
const checkoutEndpoint = `${process.env.API_ENDPOINT}/v2/billing/checkout`
const transactionEndpoint = `${process.env.API_ENDPOINT}/v2/billing/transactions`
//const merchantId = process.env.EZYPAY_MERCHANT_ID;

export async function listInvoice(branch): Promise<any> {
  const { merchantId } = await getBranchCredentials(branch)
  try {
    if (!process.env.API_ENDPOINT) {
      console.error("API_ENDPOINT environment variable is not configured")
      return []
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch)
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      return []
    }

    const url = `${apiEndpoint}?limit=30`
    const invoiceResponse = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    if (!invoiceResponse.ok) {
      const text = await invoiceResponse.text()
      console.error("List invoice failed:", invoiceResponse.status, text)
      return []
    }

    const contentType = invoiceResponse.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const text = await invoiceResponse.text()
      console.error(
        "List invoice error: Expected JSON but received:",
        contentType,
        text.substring(0, 200)
      )
      return []
    }

    const invoiceData = await invoiceResponse.json()

    return invoiceData
  } catch (err) {
    console.error("List invoice error:", err)
    return []
  }
}

export async function listInvoiceByCustomer(customerId, branch): Promise<any> {
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
    const invoiceResponse = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    const invoiceData = invoiceResponse.ok
      ? await invoiceResponse.json()
      : await invoiceResponse.text()

    if (!invoiceResponse.ok) {
      console.error(
        "List Customer invoice failed:",
        invoiceResponse.status,
        invoiceData
      )
      throw new Error(`List Customer invoice failed: ${invoiceResponse.status}`)
    }

    return invoiceData
  } catch (err) {
    console.error("List invoice error:", err)
    throw err
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
    const transactionResponse = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    const transactionData = transactionResponse.ok
      ? await transactionResponse.json()
      : await transactionResponse.text()

    if (!transactionResponse.ok) {
      console.error(
        "List transaction failed:",
        transactionResponse.status,
        transactionData
      )
      throw new Error(`List transaction failed: ${transactionResponse.status}`)
    }

    return transactionData
  } catch (err) {
    console.error("List transaction error:", err)
    throw err
  }
}

export async function retryInvoice(invoiceId, paymentMethodId, branch) {
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
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
        "Content-type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    const data = response.ok ? await response.json() : await response.text()
    await logApiCall("POST", url, data, response.status, requestBody)

    if (!response.ok) {
      console.error("Retry Invoice failed:", response.status, data)
      throw new Error(`Retry invoice failed: ${response.status}`)
    }

    return data
  } catch (err) {
    console.error("Retry Invoice failed error:", err)
    throw err
  }
}

export async function writeOffInvoice(invoiceId, branch) {
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
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
        "Content-type": "application/json",
      },
      body: "{}",
    })

    const data = response.ok ? await response.json() : await response.text()
    await logApiCall("POST", url, data, response.status, {})

    if (!response.ok) {
      console.error("Write off Invoice failed:", response.status, data)
      throw new Error(`Write off invoice failed: ${response.status}`)
    }

    return data
  } catch (err) {
    console.error("Write off Invoice failed error:", err)
    throw err
  }
}

export async function recordExternalInvoice(invoiceId, method, branch) {
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
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
        "Content-type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    const data = response.ok ? await response.json() : await response.text()
    await logApiCall("POST", url, data, response.status, requestBody)

    if (!response.ok) {
      console.error("Record External Invoice failed:", response.status, data)
      throw new Error(`Record External invoice failed: ${response.status}`)
    }

    return data
  } catch (err) {
    console.error("Record External Invoice failed error:", err)
    throw err
  }
}

export async function refundInvoice(invoiceId, amount = null, branch) {
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
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
        "Content-type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    const data = response.ok ? await response.json() : await response.text()
    await logApiCall("PUT", url, data, response.status, requestBody)

    if (!response.ok) {
      console.error("Refund Invoice failed:", response.status, data)

      try {
        const errorData = typeof data === "string" ? JSON.parse(data) : data
        return {
          success: false,
          error: {
            type: errorData.type,
            code: errorData.code,
            message: errorData.message,
          },
        }
      } catch (parseError) {
        return {
          success: false,
          error: {
            message: `Refund invoice failed: ${response.status}`,
          },
        }
      }
    }

    return data
  } catch (err) {
    console.error("Refund Invoice failed error:", err)
    return {
      success: false,
      error: {
        message: err.message || "An unexpected error occurred",
      },
    }
  }
}

export async function createInvoice(
  invoiceData: InvoiceCreation,
  branch: string
) {
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

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
        "Content-type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    const data = response.ok ? await response.json() : await response.text()
    await logApiCall("POST", apiEndpoint, data, response.status, requestBody)
    if (!response.ok) {
      console.error("Create Invoice failed:", response.status, data)
      throw new Error(`Create invoice failed: ${response.status}`)
    }

    return data
  } catch (err) {
    console.error("Create Invoice failed error:", err)
    throw err
  }
}

export async function createCheckout(invoiceData, branch) {
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

    const response = await fetch(checkoutEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
        "Content-type": "application/json",
      },
      body: JSON.stringify(invoiceData),
    })

    const data = response.ok ? await response.json() : await response.text()
    await logApiCall(
      "POST",
      checkoutEndpoint,
      data,
      response.status,
      invoiceData
    )

    if (!response.ok) {
      console.error("Create Checkout failed:", response.status, data)

      try {
        const errorData = typeof data === "string" ? JSON.parse(data) : data
        return {
          success: false,
          error: {
            type: errorData.type,
            code: errorData.code,
            message: errorData.message,
          },
        }
      } catch (parseError) {
        throw new Error(parseError)
      }
    }

    return data
  } catch (err) {
    console.error("Refund Invoice failed error:", err)
    return {
      success: false,
      error: {
        message: err.message || "An unexpected error occurred",
      },
    }
  }
}
