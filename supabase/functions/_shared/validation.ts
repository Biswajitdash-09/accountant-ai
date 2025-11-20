import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Payment validation schemas
export const createOrderSchema = z.object({
  planId: z.string().min(1, "Plan ID is required"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().length(3, "Currency must be 3 characters").toUpperCase(),
  paymentMethod: z.enum(["upi", "card", "netbanking"]).optional(),
});

export const cashfreeWebhookSchema = z.object({
  type: z.string(),
  data: z.object({
    order: z.object({
      order_id: z.string(),
      cf_payment_id: z.string().optional(),
      order_amount: z.number().optional(),
      order_currency: z.string().optional(),
      order_status: z.string().optional(),
    }),
  }),
});

export const unifiedPaymentSchema = z.object({
  provider: z.enum(["stripe", "cashfree"]),
  plan_id: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().length(3).toUpperCase(),
  payment_method: z.string().optional(),
});

// Webhook signature validation
export async function verifyCashfreeSignature(
  rawBody: string,
  signature: string | null,
  timestamp: string | null,
  secret: string
): Promise<boolean> {
  if (!signature || !timestamp) {
    console.log("[CASHFREE] Missing signature or timestamp");
    return false;
  }

  // Check timestamp to prevent replay attacks (allow 5 minute window)
  const timestampNum = parseInt(timestamp);
  const currentTime = Math.floor(Date.now() / 1000);
  const timeDiff = Math.abs(currentTime - timestampNum);
  
  if (timeDiff > 300) { // 5 minutes
    console.log("[CASHFREE] Timestamp too old", { timeDiff, currentTime, timestampNum });
    return false;
  }

  // Construct the signed payload: timestamp.rawBody
  const signedPayload = `${timestamp}.${rawBody}`;
  
  // Create HMAC using SHA256
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signedPayload)
  );
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(signatureBytes));
  const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Constant-time comparison to prevent timing attacks
  return constantTimeCompare(signature, expectedSignature);
}

// Constant-time string comparison to prevent timing attacks
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

// Generic validation helper
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: `${firstError.path.join(".")}: ${firstError.message}`,
      };
    }
    return { success: false, error: "Validation failed" };
  }
}
