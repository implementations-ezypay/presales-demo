"use server"

import { getBranchCredentials } from "./branch-config"
import axios from "axios"

export async function getEzypayToken(
  branch: string
): Promise<{ access_token: string }> {
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
    if (axios.isAxiosError(err)) {
      console.error(
        "Get Ezypay Token error:",
        err.response?.data || err.message
      )
      throw new Error(`Get Ezypay Token failed: ${err.message}`, {
        cause: err,
      })
    }
    if (err instanceof Error) {
      console.error("Get Ezypay Token error:", err)
      throw err
    }
    console.error("Get Ezypay Token error:", err)
    throw new Error(`Get Ezypay Token failed: Unknown error`, { cause: err })
  }
}
