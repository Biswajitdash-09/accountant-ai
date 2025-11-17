// Centralized error codes and messages for consistent error handling

export const ERROR_CODES = {
  // Authentication errors (AUTH_xxx)
  AUTH_001: {
    code: "AUTH_001",
    title: "Invalid API Key",
    message: "The API key you provided is invalid or has been revoked.",
    action: "Please check your API key or generate a new one in API Settings.",
  },
  AUTH_002: {
    code: "AUTH_002",
    title: "API Key Expired",
    message: "Your API key has expired.",
    action: "Generate a new API key in API Settings to continue.",
  },
  AUTH_003: {
    code: "AUTH_003",
    title: "Unauthorized Access",
    message: "You don't have permission to access this resource.",
    action: "Please contact support if you believe this is an error.",
  },

  // Rate limiting errors (RATE_xxx)
  RATE_001: {
    code: "RATE_001",
    title: "Rate Limit Exceeded",
    message: "You've exceeded the rate limit for your plan (60 requests/minute).",
    action: "Please wait {seconds} seconds before making another request, or upgrade your plan for higher limits.",
  },
  RATE_002: {
    code: "RATE_002",
    title: "Daily Limit Reached",
    message: "You've reached your daily API request limit.",
    action: "Upgrade to Pro for 50,000 daily requests or wait until tomorrow.",
  },

  // Data validation errors (DATA_xxx)
  DATA_001: {
    code: "DATA_001",
    title: "Invalid Transaction Format",
    message: "The transaction data provided doesn't match the required format.",
    action: "Please check the API documentation for the correct transaction schema.",
  },
  DATA_002: {
    code: "DATA_002",
    title: "Missing Required Field",
    message: "Required field '{field}' is missing from your request.",
    action: "Add the required field and try again.",
  },
  DATA_003: {
    code: "DATA_003",
    title: "Invalid Date Format",
    message: "Date must be in ISO 8601 format (YYYY-MM-DD).",
    action: "Update your date format and try again.",
  },

  // AI errors (AI_xxx)
  AI_001: {
    code: "AI_001",
    title: "AI Service Unavailable",
    message: "Arnold AI is temporarily unavailable.",
    action: "Please try again in a few moments. If the issue persists, contact support.",
  },
  AI_002: {
    code: "AI_002",
    title: "Context Too Large",
    message: "Your request contains too much data for processing.",
    action: "Try breaking your request into smaller chunks or reducing the date range.",
  },
  AI_003: {
    code: "AI_003",
    title: "Processing Timeout",
    message: "AI processing took too long and was terminated.",
    action: "Try a simpler query or reduce the amount of data being analyzed.",
  },

  // Database errors (DB_xxx)
  DB_001: {
    code: "DB_001",
    title: "Database Connection Error",
    message: "Unable to connect to the database.",
    action: "Please try again. If the issue persists, check your internet connection.",
  },
  DB_002: {
    code: "DB_002",
    title: "Record Not Found",
    message: "The requested resource was not found.",
    action: "Please verify the resource ID and try again.",
  },

  // Network errors (NET_xxx)
  NET_001: {
    code: "NET_001",
    title: "Network Error",
    message: "Unable to connect to the server.",
    action: "Please check your internet connection and try again.",
  },
  NET_002: {
    code: "NET_002",
    title: "Request Timeout",
    message: "The request took too long to complete.",
    action: "Please try again. If the issue persists, try a simpler operation.",
  },

  // General errors
  GEN_001: {
    code: "GEN_001",
    title: "Something Went Wrong",
    message: "An unexpected error occurred.",
    action: "Please try again. If the issue persists, contact support.",
  },
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

export interface ApiError {
  code: ErrorCode;
  title: string;
  message: string;
  action: string;
  details?: string;
  retryAfter?: number;
}

export const getErrorMessage = (
  code: ErrorCode,
  params?: Record<string, string | number>
): ApiError => {
  const error = ERROR_CODES[code] || ERROR_CODES.GEN_001;
  
  let message: string = error.message;
  let action: string = error.action;
  
  // Replace placeholders with actual values
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, String(value));
      action = action.replace(`{${key}}`, String(value));
    });
  }
  
  return {
    code,
    title: error.title,
    message,
    action,
  };
};

export const handleApiError = (error: any): ApiError => {
  // Check if it's a known error code
  if (error.code && ERROR_CODES[error.code as ErrorCode]) {
    return getErrorMessage(error.code as ErrorCode, error.params);
  }

  // Handle HTTP status codes
  if (error.status) {
    switch (error.status) {
      case 401:
        return getErrorMessage("AUTH_001");
      case 403:
        return getErrorMessage("AUTH_003");
      case 429:
        const retryAfter = error.retryAfter || 60;
        return {
          ...getErrorMessage("RATE_001", { seconds: retryAfter }),
          retryAfter,
        };
      case 404:
        return getErrorMessage("DB_002");
      case 408:
      case 504:
        return getErrorMessage("NET_002");
      case 500:
      case 502:
      case 503:
        return getErrorMessage("AI_001");
      default:
        return getErrorMessage("GEN_001");
    }
  }

  // Network errors
  if (error.message?.includes("network") || error.message?.includes("fetch")) {
    return getErrorMessage("NET_001");
  }

  // Default fallback
  return {
    ...getErrorMessage("GEN_001"),
    details: error.message || String(error),
  };
};

export const calculateRetryDelay = (attemptNumber: number): number => {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s (max 16s)
  return Math.min(1000 * Math.pow(2, attemptNumber), 16000);
};

export const shouldRetry = (error: ApiError, attemptNumber: number): boolean => {
  // Don't retry more than 3 times
  if (attemptNumber >= 3) return false;

  // Retry on network errors and server errors
  const retryableCodes: ErrorCode[] = [
    "NET_001",
    "NET_002",
    "AI_001",
    "DB_001",
  ];

  return retryableCodes.includes(error.code);
};
