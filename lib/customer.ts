"use server"
import { getEzypayToken } from "./ezypay-token"
import { logApiCall } from "./api-logger"
import { getBranchCredentials } from "./branch-config"
import axios from "axios"
import { CreateCustomer, Customer } from "./types/customer"
import { PaymentMethod } from "./types/payment-method"
import { processError } from "./utils"

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

    const response = await axios.post<Customer>(apiEndpoint, customerData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    logApiCall(
      "POST",
      apiEndpoint,
      response.data,
      response.status,
      customerData
    )
    return response.data
  } catch (err: unknown) {
    return processError("Create Customer")(err)
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
      : `${apiEndpoint}?limit=50`
    const { data } = await axios.get<{ data: Customer[] }>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    return data
  } catch (err: unknown) {
    return processError("List All Customer")(err)
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

    const url = `${apiEndpoint}/${customerId}`
    const response = await axios.get<Customer>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    return response.data
  } catch (err: unknown) {
    return processError("Get Single Customer")(err)
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

    const url = `${apiEndpoint}/${customerId}/paymentmethods`
    const response = await axios.get<{ data: PaymentMethod[] }>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    return response.data
  } catch (err: unknown) {
    return processError("Create Customer")(err)
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

    const response = await axios.put<Customer>(`${apiEndpoint}/${id}`, body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    logApiCall(
      "PUT",
      `${apiEndpoint}/${id}`,
      response.data,
      response.status,
      body
    )
    return response.data
  } catch (err: unknown) {
    return processError("Update Customer")(err)
  }
}
