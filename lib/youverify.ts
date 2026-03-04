const DEFAULT_BASE = "https://api.sandbox.youverify.co/v2";

function getYouVerifyToken() {
  const token = process.env.YOUVERIFY_TOKEN;
  if (!token) {
    throw new Error("YOUVERIFY_TOKEN is not configured");
  }
  return token;
}

function getYouVerifyBase() {
  return process.env.YOUVERIFY_BASE_URL || DEFAULT_BASE;
}

export type YouVerifyNinResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data?: {
    id: string;
    status: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    dateOfBirth?: string;
    mobile?: string;
    address?: {
      state?: string;
      lga?: string;
      town?: string;
    };
  };
};

export async function verifyNinWithYouVerify(nin: string) {
  const token = getYouVerifyToken();
  const baseUrl = getYouVerifyBase();
  
  console.log("[YOUVERIFY] Calling API with NIN:", nin.substring(0, 3) + "********");
  console.log("[YOUVERIFY] Base URL:", baseUrl);
  
  try {
    const response = await fetch(`${baseUrl}/api/identity/ng/nin`, {
      method: "POST",
      headers: {
        "token": token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: nin,
        isSubjectConsent: true
      })
    });

    console.log("[YOUVERIFY] Response status:", response.status);
    console.log("[YOUVERIFY] Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const text = await response.text();
      console.error("[YOUVERIFY] Error response:", text);
      throw new Error(`YouVerify API error (${response.status}): ${text}`);
    }

    const data = await response.json();
    console.log("[YOUVERIFY] Success response received");
    return data as YouVerifyNinResponse;
  } catch (error) {
    console.error("[YOUVERIFY] Request failed:", error);
    throw error;
  }
}
