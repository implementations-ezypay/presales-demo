"use server"
import axios, { AxiosResponse } from "axios"
import { logApiCall } from "./api-logger"
import { getBranchCredentials } from "./branch-config"
import { getEzypayToken } from "./ezypay-token"
import { documentType, Settlement } from "./types/settlement"

const apiEndpoint = `${process.env.API_ENDPOINT}/v2/billing/settlements`
const fileEndpoint = `${process.env.API_ENDPOINT}/v2/files`

export async function downloadDocument(
  settlementId: string,
  documentType: documentType,
  branch: string
): Promise<string> {
  const { merchantId } = await getBranchCredentials(branch)
  try {
    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch)
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(
        `Generate file failed: No access_token from token utility`
      )
    }

    const body = { documentType }

    const url = `${apiEndpoint}/${settlementId}/file`
    const response = await axios.post(url, body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    const settlementDoc = response.data
    await logApiCall("POST", url, settlementDoc, response.status, body)

    const fileId = settlementDoc.fileId

    const fileUrl = `${fileEndpoint}/${fileId}`
    const fileResponse = await axios.get(fileUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    const fileData = fileResponse.data
    await logApiCall("GET", fileUrl, fileData, fileResponse.status)

    const downloadUrl = fileData.url

    return downloadUrl
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        "Download settlement file error:",
        err.response?.data || err.message
      )
      throw new Error(`Download settlement file failed: ${err.message}`, {
        cause: err,
      })
    }
    if (err instanceof Error) {
      console.error("Download settlement file error:", err)
      throw err
    }
    console.error("Download settlement file error:", err)
    throw new Error(`Download settlement file failed: Unknown error`, {
      cause: err,
    })
  }
}

export async function listSettlements(branch: string): Promise<Settlement[]> {
  const { merchantId } = await getBranchCredentials(branch)
  try {
    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch)
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(
        `List settlement failed: No access_token from token utility`
      )
    }

    const url = `${apiEndpoint}?limit=100`
    const response: AxiosResponse<{ data: Settlement[] }> = await axios.get(
      url,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          merchant: merchantId,
        },
      }
    )

    const settlements = response.data
    await logApiCall("GET", url, settlements, response.status)

    return settlements.data
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("List settlement error:", err.response?.data || err.message)
      throw new Error(`List settlement failed: ${err.message}`, {
        cause: err,
      })
    }
    if (err instanceof Error) {
      console.error("List settlement error:", err)
      throw err
    }
    console.error("List settlement error:", err)
    throw new Error(`List settlement failed: Unknown error`, { cause: err })
  }
}
