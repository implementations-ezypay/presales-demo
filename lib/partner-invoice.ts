"use server"

import axios from "axios"
import { logApiCall } from "./api-logger"
import { getBranchCredentials } from "./branch-config"
import { getBranchCurrency } from "./branches"
import { getEzypayToken } from "./ezypay-token"
import { processError } from "./utils"

const apiEndpoint = `${process.env.API_ENDPOINT}/v2/partnerinvoices`

export type PartnerInvoiceItem = {
  description: string
  amount: {
    currency: string
    value: number
  }
}

export type PartnerInvoice = {
  id?: string
  issuerMerchantId: string
  recipientMerchantId: string
  memo: string
  items: PartnerInvoiceItem[]
}

/**
 * Create a partner invoice between two merchants.
 *
 * The invoice is issued by the requesting branch (issuer) and billed to the
 * source branch (recipient). Authentication uses the issuer branch's Ezypay
 * token and merchant header.
 */
export async function createPartnerInvoice({
  issuerBranch,
  recipientBranch,
  memo,
  itemDescription,
  amount,
}: {
  issuerBranch: string
  recipientBranch: string
  memo: string
  itemDescription: string
  amount: number
}): Promise<PartnerInvoice> {
  const { merchantId: issuerMerchantId } =
    await getBranchCredentials(issuerBranch)
  const { merchantId: recipientMerchantId } =
    await getBranchCredentials(recipientBranch)

  try {
    if (!issuerMerchantId || !recipientMerchantId) {
      throw new Error("Missing merchant id for issuer or recipient branch")
    }

    // Authenticate as the issuer (requesting) branch.
    const tokenData = await getEzypayToken(issuerBranch)
    const token = tokenData.access_token

    const body: PartnerInvoice = {
      issuerMerchantId,
      recipientMerchantId,
      memo,
      items: [
        {
          description: itemDescription,
          amount: {
            currency: getBranchCurrency(issuerBranch),
            value: amount,
          },
        },
      ],
    }

    const response = await axios.post<PartnerInvoice>(apiEndpoint, body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        merchant: issuerMerchantId,
      },
    })

    logApiCall("POST", apiEndpoint, response.data, response.status, body)
    return response.data
  } catch (err: unknown) {
    return processError("Create Partner Invoice")(err)
  }
}
