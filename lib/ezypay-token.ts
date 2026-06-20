"use server"

import { getBranchCredentials } from "./branch-config"
import axios from "axios"
import { processError } from "./utils"

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
      scope: "integrator billing_profile create_payment_method offline_access partner",
    }
    const { data } = await axios.post<{ access_token: string }>(
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
    return processError("Getting Ezypay token")(err)
  }
}
