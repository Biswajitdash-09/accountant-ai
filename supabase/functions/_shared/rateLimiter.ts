// Rate limiter for edge functions
// Uses in-memory storage with cleanup for Deno environment

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

// In-memory store (per edge function instance)
const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimiterConfig {
  maxTokens: number; // Maximum tokens in bucket
  refillRate: number; // Tokens added per second
  tokensPerRequest: number; // Tokens consumed per request
}

// Tier-based configurations
export const RATE_LIMIT_TIERS: Record<string, RateLimiterConfig> = {
  free: {
    maxTokens: 20,
    refillRate: 0.33, // ~20 per minute
    tokensPerRequest: 1,
  },
  starter: {
    maxTokens: 100,
    refillRate: 1.67, // ~100 per minute
    tokensPerRequest: 1,
  },
  pro: {
    maxTokens: 300,
    refillRate: 5, // ~300 per minute
    tokensPerRequest: 1,
  },
  business: {
    maxTokens: 500,
    refillRate: 8.33, // ~500 per minute
    tokensPerRequest: 1,
  },
  unlimited: {
    maxTokens: 10000,
    refillRate: 1000,
    tokensPerRequest: 1,
  },
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number; // Seconds until bucket is full
  limit: number;
}

/**
 * Token bucket rate limiter
 * @param identifier - Unique identifier (usually user ID or IP)
 * @param tier - Rate limit tier (free, starter, pro, business)
 * @returns RateLimitResult
 */
export function checkRateLimit(
  identifier: string,
  tier: string = 'free'
): RateLimitResult {
  const config = RATE_LIMIT_TIERS[tier] || RATE_LIMIT_TIERS.free;
  const now = Date.now();
  
  let entry = rateLimitStore.get(identifier);
  
  if (!entry) {
    // New entry with full bucket
    entry = {
      tokens: config.maxTokens,
      lastRefill: now,
    };
    rateLimitStore.set(identifier, entry);
  } else {
    // Calculate tokens to add since last refill
    const timePassed = (now - entry.lastRefill) / 1000; // Convert to seconds
    const tokensToAdd = timePassed * config.refillRate;
    
    // Refill bucket (cap at max)
    entry.tokens = Math.min(config.maxTokens, entry.tokens + tokensToAdd);
    entry.lastRefill = now;
  }
  
  // Check if request is allowed
  const allowed = entry.tokens >= config.tokensPerRequest;
  
  if (allowed) {
    // Consume tokens
    entry.tokens -= config.tokensPerRequest;
    rateLimitStore.set(identifier, entry);
  }
  
  // Calculate reset time
  const tokensNeeded = config.maxTokens - entry.tokens;
  const resetIn = Math.ceil(tokensNeeded / config.refillRate);
  
  return {
    allowed,
    remaining: Math.floor(entry.tokens),
    resetIn,
    limit: config.maxTokens,
  };
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetIn.toString(),
  };
}

/**
 * Create rate limit exceeded response
 */
export function rateLimitExceededResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message: `Too many requests. Please wait ${result.resetIn} seconds before trying again.`,
      retry_after: result.resetIn,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': result.resetIn.toString(),
        ...getRateLimitHeaders(result),
      },
    }
  );
}

/**
 * Middleware-style rate limiter for edge functions
 * Usage:
 * const rateLimitResult = await rateLimit(req, 'user-id', 'pro');
 * if (rateLimitResult) return rateLimitResult; // Returns 429 response
 */
export async function rateLimit(
  req: Request,
  identifier: string | null,
  tier: string = 'free',
  corsHeaders: Record<string, string> = {}
): Promise<Response | null> {
  // Use identifier or fall back to IP
  const key = identifier || 
    req.headers.get('x-forwarded-for')?.split(',')[0] || 
    req.headers.get('cf-connecting-ip') ||
    'anonymous';
  
  const result = checkRateLimit(key, tier);
  
  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: `Too many requests. Please wait ${result.resetIn} seconds.`,
        retry_after: result.resetIn,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': result.resetIn.toString(),
          ...getRateLimitHeaders(result),
          ...corsHeaders,
        },
      }
    );
  }
  
  return null; // Request allowed
}

// Cleanup old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  const maxAge = 5 * 60 * 1000; // 5 minutes
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.lastRefill > maxAge) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);
