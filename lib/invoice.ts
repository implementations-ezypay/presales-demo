"use server"

import axios from "axios"
import { compareDesc } from "date-fns"
import { randomUUID } from "node:crypto"
import { logApiCall } from "./api-logger"
import { getBranchCredentials } from "./branch-config"
import { getEzypayToken } from "./ezypay-token"
import {
  CheckoutInvoiceCreation,
  CheckoutResponse,
  Invoice,
  InvoiceCreation,
  TerminalInvoiceCreation,
  Transaction,
} from "./types/invoice"
import { processError } from "./utils"

const apiEndpoint = `${process.env.API_ENDPOINT}/v2/billing/invoices`
const checkoutEndpoint = `${process.env.API_ENDPOINT}/v2/billing/checkout`
const transactionEndpoint = `${process.env.API_ENDPOINT}/v2/billing/transactions`
const terminalEndpoint = `${process.env.API_ENDPOINT}/v2/billing/terminal`

export async function listInvoice(
  branch: string
): Promise<{ data: Invoice[] }> {
  const { merchantId } = await getBranchCredentials(branch)
  try {
    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch)
    const token = tokenData.access_token

    const url = `${apiEndpoint}?limit=50`
    const terminalUrl = `${terminalEndpoint}/invoices?limit=50`

    const invoices = axios.get<{ data: Invoice[] }>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    const terminalInvoices = axios.get<{ data: Invoice[] }>(terminalUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    const [response, terminalResponse] = await Promise.all([
      invoices,
      terminalInvoices,
    ])

    const combinedResponseData = response.data.data.concat(
      terminalResponse.data.data
    )

    combinedResponseData.sort((a, b) => compareDesc(a.createdOn, b.createdOn))

    return { data: combinedResponseData }
  } catch (err: unknown) {
    return processError("List All Invoice")(err)
  }
}

export async function listOneInvocie(
  invoiceId: string,
  branch: string
): Promise<Invoice> {
  const { merchantId } = await getBranchCredentials(branch)
  try {
    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch)
    const token = tokenData.access_token

    const url = `${apiEndpoint}/${invoiceId}`
    const terminalUrl = `${terminalEndpoint}/invoices/${invoiceId}`
    const invoices = axios.get<Invoice>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })
    const terminalInvoices = axios.get<Invoice>(terminalUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    const response = await Promise.any([invoices, terminalInvoices])

    return response.data
  } catch (err: unknown) {
    return processError("List Single Customer")(err)
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

    const url = `${apiEndpoint}?customerId=${customerId}&limit=30`
    const terminalUrl = `${terminalEndpoint}/invoices?customerId=${customerId}&limit=30`

    const invoices = axios.get<{ data: Invoice[] }>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    const terminalInvoices = axios.get<{ data: Invoice[] }>(terminalUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    const [response, terminalResponse] = await Promise.all([
      invoices,
      terminalInvoices,
    ])

    const combinedResponseData = response.data.data.concat(
      terminalResponse.data.data
    )

    combinedResponseData.sort((a, b) => compareDesc(a.createdOn, b.createdOn))

    return { data: combinedResponseData }
  } catch (err: unknown) {
    return processError("List Customer Invoice")(err)
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

    const url = `${transactionEndpoint}?documentId=${invoiceId}&limit=10`
    const response = await axios.get<{ data: Transaction[] }>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    return response.data
  } catch (err: unknown) {
    return processError("List Transaction")(err)
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

    const requestBody = {
      paymentMethodToken: paymentMethodId,
      oneOff: true,
    }

    const url = `${apiEndpoint}/${invoiceId}/retrypayment`
    const response = await axios.post<Invoice>(url, requestBody, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
        "Content-type": "application/json",
      },
    })

    const data = response.data
    logApiCall("POST", url, data, response.status, requestBody)

    return data
  } catch (err: unknown) {
    return processError("Retry")(err)
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

    const url = `${apiEndpoint}/${invoiceId}/writeoff`
    const response = await axios.post<Invoice>(
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
    logApiCall("POST", url, data, response.status, {})

    return data
  } catch (err: unknown) {
    return processError("Write Off invoice")(err)
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
    const response = await axios.post<Invoice>(url, requestBody, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
        "Content-type": "application/json",
      },
    })

    const data = response.data
    logApiCall("POST", url, data, response.status, requestBody)

    return data
  } catch (err: unknown) {
    return processError("Track External Invoice")(err)
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

    const requestBody = amount ? { amount: amount } : {}

    const url = `${apiEndpoint}/${invoiceId}/refund`
    const response = await axios.put<Invoice>(url, requestBody, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
        "Content-type": "application/json",
      },
    })

    const data = response.data
    logApiCall("PUT", url, data, response.status, requestBody)

    return data
  } catch (err: unknown) {
    return processError("Refund Invoice")(err)
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

    const requestBody: InvoiceCreation = {
      ...invoiceData,
      externalInvoiceId: randomUUID(),
      processingModel: "cardonfile",
    }

    const response = await axios.post<Invoice>(apiEndpoint, requestBody, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
        "Content-type": "application/json",
      },
    })

    const data = response.data
    logApiCall("POST", apiEndpoint, data, response.status, requestBody)

    return data
  } catch (err: unknown) {
    return processError("Create Invoice")(err)
  }
}

export async function createTerminalInvoice(
  invoiceData: TerminalInvoiceCreation,
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

    const requestBody: TerminalInvoiceCreation = {
      ...invoiceData,
      externalInvoiceId: randomUUID(),
    }

    const response = await axios.post<Invoice>(
      `${terminalEndpoint}/invoices`,
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
    logApiCall("POST", apiEndpoint, data, response.status, requestBody)

    return data
  } catch (err: unknown) {
    return processError("Create Terminal Invoice")(err)
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

    const response = await axios.post<CheckoutResponse>(
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
    logApiCall("POST", checkoutEndpoint, data, response.status, invoiceData)

    return data
  } catch (err: unknown) {
    return processError("Create Checkout")(err)
  }
}
