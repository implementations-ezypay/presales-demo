"use server"
import { getEzypayToken } from "./ezypay-token"
import { logApiCall } from "./api-logger"
import { getBranchCredentials } from "./branch-config"
import axios, { AxiosResponse } from "axios"
import { CreateCustomer, Customer } from "./types/customer"
import { PaymentMethod } from "./types/payment-method"

const apiEndpoint = `${process.env.API_ENDPOINT}/v2/billing/customers`

export async function createCustomer(
  customerData: CreateCustomer,
  branch: string
): Promise<Customer> {
  const { merchantId } = await getBranchCredentials(branch)
  try {
    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch)
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(
        `Create customer failed: No access_token from token utility`
      )
    }

    const response: AxiosResponse<Customer> = await axios.post(
      apiEndpoint,
      customerData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          merchant: merchantId,
        },
      }
    )

    logApiCall(
      "POST",
      apiEndpoint,
      response.data,
      response.status,
      customerData
    )
    return response.data
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("Create customer error:", err.response?.data || err.message)
      throw new Error(`Create customer failed: ${err.message}`, {
        cause: err,
      })
    }
    if (err instanceof Error) {
      console.error("Create customer error:", err)
      throw err
    }
    console.error("Create customer error:", err)
    throw new Error(`Create customer failed: Unknown error`, { cause: err })
  }
}

export async function listCustomer(
  branch: string,
  customerNumber: string | null = null
): Promise<{ data: Customer[] }> {
  const { merchantId } = await getBranchCredentials(branch)
  try {
    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch)
    const token = tokenData.access_token

    const url = customerNumber
      ? `${apiEndpoint}?customerNumber=${customerNumber}`
      : `${apiEndpoint}?limit=30`
    const { data }: { data: { data: Customer[] } } = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    return data
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(`List Customer error: ${err.message}`, {
        cause: err,
      })
    }
    if (err instanceof Error) {
      throw new Error(`List Customer error: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export async function getCustomer(
  customerId: string | null,
  branch: string
): Promise<Customer> {
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

    const url = `${apiEndpoint}/${customerId}`
    const response: AxiosResponse<Customer> = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    return response.data
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("List customer error:", err.response?.data || err.message)
      throw new Error(`List customer failed: ${err.message}`, {
        cause: err,
      })
    }
    if (err instanceof Error) {
      console.error("List customer error:", err)
      throw err
    }
    console.error("List customer error:", err)
    throw new Error(`List customer failed: Unknown error`, { cause: err })
  }
}

export async function getCustomerPaymentMethods(
  customerId: string,
  branch: string
): Promise<{ data: PaymentMethod[] }> {
  const { merchantId } = await getBranchCredentials(branch)
  try {
    if (!customerId) {
      throw new Error("No customer ID provided")
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch)
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error("Unable to get access token")
    }

    const url = `${apiEndpoint}/${customerId}/paymentmethods`
    const response: AxiosResponse<{ data: PaymentMethod[] }> = await axios.get(
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
        "List customer payment method error:",
        err.response?.data || err.message
      )
      throw new Error(`List customer payment method error: ${err.message}`, {
        cause: err,
      })
    }
    if (err instanceof Error) {
      console.error("List customer payment method error:", err)
      throw err
    }
    console.error("List customer payment method error:", err)
    throw new Error(`List customer payment method error: Unknown error`, {
      cause: err,
    })
  }
}

export async function updateCustomer(
  customer: Customer,
  branch: string
): Promise<Customer> {
  const { merchantId } = await getBranchCredentials(branch)
  try {
    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch)
    const token = tokenData.access_token
    const { id, ...body } = customer

    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(
        `Create customer failed: No access_token from token utility`
      )
    }
    const response: AxiosResponse<Customer> = await axios.put(
      `${apiEndpoint}/${id}`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          merchant: merchantId,
        },
      }
    )

    await logApiCall(
      "PUT",
      `${apiEndpoint}/${id}`,
      response.data,
      response.status,
      body
    )
    return response.data
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("Create customer error:", err.response?.data || err.message)
      throw new Error(`Create customer failed: ${err.message}`, {
        cause: err,
      })
    }
    if (err instanceof Error) {
      console.error("Create customer error:", err)
      throw err
    }
    console.error("Create customer error:", err)
    throw new Error(`Create customer failed: Unknown error`, { cause: err })
  }
}
