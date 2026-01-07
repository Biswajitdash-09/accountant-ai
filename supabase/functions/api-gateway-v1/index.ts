import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RateLimitInfo {
  requests_count: number;
  window_start: Date;
  limit_per_minute: number;
}

const rateLimitMap = new Map<string, RateLimitInfo>();

async function validateApiKey(supabase: any, apiKey: string) {
  const keyHash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(apiKey)
  );
  const hashHex = Array.from(new Uint8Array(keyHash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const { data: key, error } = await supabase
    .from('api_keys')
    .select('id, user_id, is_active, rate_limit_per_minute, expires_at')
    .eq('key_hash', hashHex)
    .single();

  if (error || !key) {
    return { valid: false, error: 'Invalid API key', code: 'AUTH_001' };
  }

  if (!key.is_active) {
    return { valid: false, error: 'API key is inactive', code: 'AUTH_002' };
  }

  if (key.expires_at && new Date(key.expires_at) < new Date()) {
    return { valid: false, error: 'API key has expired', code: 'AUTH_003' };
  }

  return { valid: true, key };
}

function checkRateLimit(keyId: string, limitPerMinute: number): { allowed: boolean; remaining: number } {
  const now = new Date();
  const info = rateLimitMap.get(keyId);

  if (!info) {
    rateLimitMap.set(keyId, {
      requests_count: 1,
      window_start: now,
      limit_per_minute: limitPerMinute
    });
    return { allowed: true, remaining: limitPerMinute - 1 };
  }

  const windowAge = now.getTime() - info.window_start.getTime();
  
  if (windowAge > 60000) {
    info.requests_count = 1;
    info.window_start = now;
    return { allowed: true, remaining: limitPerMinute - 1 };
  }

  if (info.requests_count >= limitPerMinute) {
    const resetIn = Math.ceil((60000 - windowAge) / 1000);
    return { allowed: false, remaining: 0 };
  }

  info.requests_count++;
  return { allowed: true, remaining: limitPerMinute - info.requests_count };
}

async function logUsage(
  supabase: any,
  keyId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTime: number,
  creditsConsumed: number
) {
  await supabase.from('api_usage_logs').insert({
    api_key_id: keyId,
    endpoint,
    method,
    status_code: statusCode,
    response_time_ms: responseTime,
    credits_consumed: creditsConsumed
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing or invalid Authorization header. Use format: Bearer <api_key>",
        code: "AUTH_000"
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const apiKey = authHeader.replace("Bearer ", "");
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const validation = await validateApiKey(supabase, apiKey);
    if (!validation.valid) {
      return new Response(JSON.stringify({
        success: false,
        error: validation.error,
        code: validation.code
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { key } = validation;
    const rateLimit = checkRateLimit(key.id, key.rate_limit_per_minute || 60);
    
    if (!rateLimit.allowed) {
      await logUsage(supabase, key.id, req.url, req.method, 429, Date.now() - startTime, 0);
      
      return new Response(JSON.stringify({
        success: false,
        error: `Rate limit exceeded. Limit: ${key.rate_limit_per_minute || 60} requests per minute.`,
        code: "RATE_001",
        reset_in_seconds: 60
      }), {
        status: 429,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "X-RateLimit-Limit": String(key.rate_limit_per_minute || 60),
          "X-RateLimit-Remaining": "0"
        }
      });
    }

    const url = new URL(req.url);
    const path = url.pathname;

    const routes: { [key: string]: string } = {
      "/api-gateway-v1/arnold-chat": "api-v1-arnold-chat",
      "/api-gateway-v1/reports": "api-v1-reports",
      "/api-gateway-v1/analytics": "api-v1-analytics",
      "/api-gateway-v1/tax": "api-v1-tax",
      "/api-gateway-v1/transactions": "api-v1-transactions",
      "/api-gateway-v1/forecasts": "api-v1-forecasts"
    };

    const functionName = routes[path];
    
    if (!functionName) {
      await logUsage(supabase, key.id, path, req.method, 404, Date.now() - startTime, 0);
      
      return new Response(JSON.stringify({
        success: false,
        error: "Endpoint not found",
        code: "ROUTE_001",
        available_endpoints: Object.keys(routes)
      }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const body = req.method !== 'GET' ? await req.json() : {};
    
    // SECURITY: Inject authenticated user ID into headers, not body
    // This prevents clients from spoofing user_id in the request
    const response = await supabase.functions.invoke(functionName, {
      body: { ...body, user_id: key.user_id },
      headers: {
        'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        'x-authenticated-user-id': key.user_id
      }
    });

    const responseTime = Date.now() - startTime;
    const statusCode = response.error ? 500 : 200;
    const creditsConsumed = functionName.includes('arnold') ? 2 : 1;

    await logUsage(supabase, key.id, path, req.method, statusCode, responseTime, creditsConsumed);

    if (response.error) {
      return new Response(JSON.stringify({
        success: false,
        error: response.error.message || "Internal server error",
        code: "SERVER_001"
      }), {
        status: 500,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "X-Response-Time": `${responseTime}ms`,
          "X-RateLimit-Remaining": String(rateLimit.remaining)
        }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: response.data,
      metadata: {
        response_time_ms: responseTime,
        credits_consumed: creditsConsumed,
        rate_limit_remaining: rateLimit.remaining
      }
    }), {
      status: 200,
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json",
        "X-Response-Time": `${responseTime}ms`,
        "X-RateLimit-Remaining": String(rateLimit.remaining)
      }
    });

  } catch (error) {
    console.error("[API-GATEWAY] Error:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      code: "SERVER_002"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
