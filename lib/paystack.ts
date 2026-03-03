import crypto from "crypto";

const PAYSTACK_API = "https://api.paystack.co";

function getPaystackSecret() {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }
  return secret;
}

export type PaystackInitResponse = {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

export async function initializePaystackTransaction(params: {
  email: string;
  amount: number;
  reference: string;
  metadata?: Record<string, unknown>;
  channels?: string[];
}) {
  const secret = getPaystackSecret();
  const response = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amount,
      reference: params.reference,
      metadata: params.metadata,
      channels: params.channels
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Paystack init failed: ${text}`);
  }

  return (await response.json()) as PaystackInitResponse;
}

export async function verifyPaystackTransaction(reference: string) {
  const secret = getPaystackSecret();
  const response = await fetch(`${PAYSTACK_API}/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${secret}`
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Paystack verify failed: ${text}`);
  }

  return (await response.json()) as {
    status: boolean;
    message: string;
    data: {
      status: string;
      reference: string;
      amount: number;
      currency: string;
      customer: { email: string };
      metadata?: Record<string, unknown>;
    };
  };
}

export function verifyPaystackSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const secret = getPaystackSecret();
  const hash = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");
  return hash === signature;
}
