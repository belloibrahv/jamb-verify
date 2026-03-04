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
  
  let lastError: unknown;
  
  // Retry up to 3 times for 502/503 errors (sandbox API instability)
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`[YOUVERIFY] Attempt ${attempt}/3`);
      
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

      console.log(`[YOUVERIFY] Response status (attempt ${attempt}):`, response.status);

      // Handle rate limiting (429)
      if (response.status === 429) {
        const data = await response.json();
        console.warn(`[YOUVERIFY] Rate limit hit (attempt ${attempt}):`, data.message);
        throw new Error(data.message || "Too many requests. Please try again in 10 minutes.");
      }

      // Retry on 502/503 errors (server errors)
      if (response.status === 502 || response.status === 503) {
        const text = await response.text();
        console.warn(`[YOUVERIFY] Server error (attempt ${attempt}):`, text);
        lastError = new Error(`YouVerify API error (${response.status}): ${text}`);
        
        if (attempt < 3) {
          const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s
          console.log(`[YOUVERIFY] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }

      // Don't retry on other error codes (400, 401, 403, 404, etc.)
      if (!response.ok) {
        const data = await response.json();
        console.error("[YOUVERIFY] Error response:", data);
        const errorMsg = data.message || `API error (${response.status})`;
        throw new Error(errorMsg);
      }

      const data = await response.json();
      console.log(`[YOUVERIFY] Success response received (attempt ${attempt})`);
      return data as YouVerifyNinResponse;
      
    } catch (error) {
      // Network errors or JSON parse errors
      if (error instanceof Error && !error.message.includes('YouVerify API error')) {
        console.error(`[YOUVERIFY] Request failed (attempt ${attempt}):`, error);
        lastError = error;
        
        if (attempt < 3) {
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(`[YOUVERIFY] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      } else {
        // API errors (non-502/503) - don't retry
        throw error;
      }
    }
  }
  
  console.error("[YOUVERIFY] All retry attempts failed");
  throw lastError;
}
