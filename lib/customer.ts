"use server"
import { getEzypayToken } from "./ezypay-token"
import { logApiCall } from "./api-logger"
import { getBranchCredentials } from "./branch-config"
import axios from "axios"
import { Customer } from "./types/customer"

const apiEndpoint = `${process.env.API_ENDPOINT}/v2/billing/customers`

export async function createCustomer(
  customerData,
  branch: string
): Promise<any> {
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

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
      body: JSON.stringify(customerData),
    })

    const data = response.ok ? await response.json() : await response.text()
    await logApiCall("POST", apiEndpoint, data, response.status, customerData)

    if (!response.ok) {
      console.error("Created customer failed:", response.status, data)
      throw new Error(`Create customer failed: ${response.status}`)
    }

    return data
  } catch (err) {
    console.error("Create customer error:", err)
    throw err
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
      throw new Error(
        `List Customer error: ${JSON.stringify(err.response?.data) || err.message}`,
        { cause: err }
      )
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
): Promise<any> {
  console.log(branch, customerId)
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
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    const data = response.ok ? await response.json() : await response.text()

    if (!response.ok) {
      console.error("List customer failed:", response.status, data)
      throw new Error(`List customer failed: ${response.status}`)
    }

    return data
  } catch (err) {
    console.error("List customer error:", err)
    throw err
  }
}

export async function getCustomerPaymentMethods(
  customerId: string,
  branch: string
): Promise<any> {
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
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    const data = await res.json()

    return data
  } catch (err) {
    console.error("List customer payment method error:", err)
  }
}

export async function updateCustomer(customer, branch: string): Promise<any> {
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
    const response = await fetch(`${apiEndpoint}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
      body: JSON.stringify(body),
    })

    const data = response.ok ? await response.json() : await response.text()
    await logApiCall("PUT", `${apiEndpoint}/${id}`, data, response.status, body)

    if (!response.ok) {
      console.error("Created customer failed:", response.status, data)
      throw new Error(`Create customer failed: ${response.status}`)
    }

    return data
  } catch (err) {
    console.error("Create customer error:", err)
    throw err
  }
}
