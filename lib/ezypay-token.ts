"use server"

import { getBranchCredentials } from "./branch-config"
import axios from "axios"

export async function getEzypayToken(branch: string): Promise<{
  access_token: string
  error?: string
}> {
  try {
    // Get selected branch from client-side storage via header or default to main
    const credentials = await getBranchCredentials(branch)
    const { clientId, clientSecret, username, password } = credentials
    if (!clientId || !clientSecret || !username || !password) {
      throw new Error(
        `Missing EZYPAY_* environment variables for branch '${branch}'`
      )
    }

    const tokenUrl = "https://identity-sandbox.ezypay.com/token"
    const body = {
      grant_type: "password",
      client_id: clientId,
      client_secret: clientSecret,
      username: username,
      password: password,
      scope: "integrator billing_profile create_payment_method offline_access",
    }
    const { data }: { data: { access_token: string } } = await axios.post(
      tokenUrl,
      body,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )

    if (!data.access_token) {
      console.error("No access_token in response:", data)
      throw new Error("No access_token in response")
    }
    return data
  } catch (err: unknown) {
    console.log("is error, going to throw error", axios.isAxiosError(err))
    if (axios.isAxiosError(err)) {
      throw new Error(err.response?.data || err.message)
    }
    if (err instanceof Error) {
      throw new Error(err.message)
    }
    throw err
  }
}
