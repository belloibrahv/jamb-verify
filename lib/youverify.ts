const DEFAULT_BASE = "https://api.youverify.co/v1";

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
  message: string;
  status_code: number;
  data?: {
    id: string;
    type: string;
    reference_id: string;
    status: string;
    response?: {
      first_name?: string;
      middle_name?: string;
      last_name?: string;
      dob?: string;
      mobile?: string;
    };
  };
};

export async function verifyNinWithYouVerify(nin: string) {
  const token = getYouVerifyToken();
  const baseUrl = getYouVerifyBase();
  const response = await fetch(`${baseUrl}/identities/candidates/check`, {
    method: "POST",
    headers: {
      token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      report_type: "identity",
      type: "nin",
      reference: nin,
      subject_consent: true
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`YouVerify error: ${text}`);
  }

  return (await response.json()) as YouVerifyNinResponse;
}
