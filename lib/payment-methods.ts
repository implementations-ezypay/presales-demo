"use server";

import { getEzypayToken } from "./ezypay-token";
import { logApiCall } from "./api-logger";
import { getBranchCredentials } from "./branch-config";

const apiEndpoint = `${process.env.API_ENDPOINT}/v2/billing/customers`;
const mandateEndpoint = `${process.env.API_ENDPOINT}/v2/npp/mandate/status`;
const vaultEndpoint = `${process.env.VAULT_ENDPOINT}/v2/vault`;

export async function replacePaymentMethod(
  customerId,
  paymentMethod,
  newPaymentMethod,
  branch,
) {
  const { merchantId } = await getBranchCredentials(branch);
  try {
    if (!customerId || !paymentMethod || !newPaymentMethod) {
      throw new Error("Not enough information");
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch);
    const token = tokenData.access_token;
    if (!token) {
      console.error("No access_token from token utility", tokenData);
      throw new Error(
        `Replace Payment Method failed: No access_token from token utility`,
      );
    }

    const url = `${apiEndpoint}/${customerId}/paymentmethods/${paymentMethod}/new`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
        "Content-type": "application/json",
      },
      body: `{"newPaymentMethodToken":"${newPaymentMethod}"}`,
    });

    const data = response.ok ? await response.json() : await response.text();
    await logApiCall("PUT", url, data, response.status, {
      newPaymentMethodToken: newPaymentMethod,
    });

    if (!response.ok) {
      console.error("Replace Payment Method failed:", response.status, data);

      try {
        const errorData = typeof data === "string" ? JSON.parse(data) : data;
        return {
          success: false,
          error: {
            type: errorData.type,
            code: errorData.code,
            message: errorData.message,
          },
        };
      } catch (parseError) {
        return {
          success: false,
          error: {
            message: `Replace Payment Method failed: ${response.status}`,
          },
        };
      }
    }

    return {
      success: true,
      data: data,
    };
  } catch (err) {
    console.error("Replace Payment Method failed error:", err);
    return {
      success: false,
      error: {
        message: err.message || "An unexpected error occurred",
      },
    };
  }
}

export async function deletePaymentMethod(customerId, paymentMethod, branch) {
  const { merchantId } = await getBranchCredentials(branch);
  try {
    if (!customerId || !paymentMethod) {
      throw new Error("Not enough information");
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch);
    const token = tokenData.access_token;
    if (!token) {
      console.error("No access_token from token utility", tokenData);
      throw new Error(
        `Delete Payment Method failed: No access_token from token utility`,
      );
    }

    const url = `${apiEndpoint}/${customerId}/paymentmethods/${paymentMethod}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    });

    const data = response.ok ? await response.json() : await response.text();
    await logApiCall("DELETE", url, data, response.status);

    if (!response.ok) {
      console.error("Delete Payment Method failed:", response.status, data);

      try {
        const errorData = typeof data === "string" ? JSON.parse(data) : data;
        return {
          success: false,
          error: {
            type: errorData.type,
            code: errorData.code,
            message: errorData.message,
          },
        };
      } catch (parseError) {
        return {
          success: false,
          error: {
            message: `Delete Payment Method failed: ${response.status}`,
          },
        };
      }
    }

    return {
      success: true,
      data: data,
    };
  } catch (err) {
    console.error("Delete Payment Method failed error:", err);
    return {
      success: false,
      error: {
        message: err.message || "An unexpected error occurred",
      },
    };
  }
}

export async function linkPaymentMethod(customerId, paymentMethod, branch) {
  const { merchantId } = await getBranchCredentials(branch);
  try {
    if (!customerId || !paymentMethod) {
      throw new Error("Not enough information");
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch);
    const token = tokenData.access_token;
    if (!token) {
      console.error("No access_token from token utility", tokenData);
      throw new Error(
        `Link Payment Method failed: No access_token from token utility`,
      );
    }

    const url = `${apiEndpoint}/${customerId}/paymentmethods`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
        "Content-type": "application/json",
      },
      body: `{"paymentMethodToken":"${paymentMethod}"}`,
    });

    const data = response.ok ? await response.json() : await response.text();
    await logApiCall("POST", url, data, response.status, {
      paymentMethodToken: paymentMethod,
    });

    if (!response.ok) {
      console.error("Link Payment Method failed:", response.status, data);

      try {
        const errorData = typeof data === "string" ? JSON.parse(data) : data;
        return {
          success: false,
          error: {
            type: errorData.type,
            code: errorData.code,
            message: errorData.message,
          },
        };
      } catch (parseError) {
        return {
          success: false,
          error: {
            message: `Link Payment Method failed: ${response.status}`,
          },
        };
      }
    }

    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error("Link Payment Method failed error:", err);
    return {
      success: false,
      error: {
        message: err.message || "An unexpected error occurred",
      },
    };
  }
}

export async function activatePayTo(
  paymentMethodToken: string,
  branch: string,
  action: string,
) {
  const { merchantId } = await getBranchCredentials(branch);
  try {
    if (!paymentMethodToken) {
      throw new Error("Payment method token is required");
    }

    // Get token directly from utility function
    const tokenData = await getEzypayToken(branch);
    const token = tokenData.access_token;
    if (!token) {
      console.error("No access_token from token utility", tokenData);
      throw new Error(
        `Activate PayTo failed: No access_token from token utility`,
      );
    }

    const body = new URLSearchParams();

    if (action === "authorise") {
      body.append("mandateStatus", "ACTV");
    } else {
      body.append("mandateStatus", "CNCD");
    }

    const url = `${mandateEndpoint}/${paymentMethodToken}/mock`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    await logApiCall(
      "POST",
      url,
      "",
      response.status,
      Object.fromEntries(body),
    );

    if (!response.ok) {
      console.error("Activate PayTo failed:", response.status);
    }

    return {
      success: true,
      data: "",
    };
  } catch (err: any) {
    console.error("Activate PayTo error:", err);
    return {
      success: false,
      error: {
        message: err.message || "An unexpected error occurred",
      },
    };
  }
}

export async function createPromptPay(customerId, branch) {
  const { merchantId } = await getBranchCredentials(branch);
  try {
    if (!customerId) {
      throw new Error("Missing customer ID");
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken(branch);
    const token = tokenData.access_token;
    if (!token) {
      console.error("No access_token from token utility", tokenData);
      throw new Error(
        `Create PromptPay Token failed: No access_token from token utility`,
      );
    }

    const body = {
      accountHolderName: "customer",
      countryCode: "TH",
      qrType: "PROMPTPAY",
      termAndConditionAgreed: true,
      customerId,
    };

    const url = `${vaultEndpoint}/paymentmethodtokens/qrpayment`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
        "Content-type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = response.ok ? await response.json() : await response.text();
    await logApiCall("POST", url, data, response.status, body);

    if (!response.ok) {
      console.error("Create PromptPay failed:", response.status, data);

      try {
        const errorData = typeof data === "string" ? JSON.parse(data) : data;
        return {
          success: false,
          error: {
            type: errorData.type,
            code: errorData.code,
            message: errorData.message,
          },
        };
      } catch (parseError) {
        return {
          success: false,
          error: {
            message: `Create PromptPay failed: ${response.status}`,
          },
        };
      }
    }

    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error("Create PromptPay failed error:", err);
    return {
      success: false,
      error: {
        message: err.message || "An unexpected error occurred",
      },
    };
  }
}
