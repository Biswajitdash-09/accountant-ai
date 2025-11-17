import { useState, useCallback } from "react";
import { calculateRetryDelay, shouldRetry, handleApiError, ApiError } from "@/lib/errorCodes";
import { useToast } from "./use-toast";

interface UseRetryOptions {
  maxAttempts?: number;
  onError?: (error: ApiError) => void;
  showToast?: boolean;
}

export const useRetry = <T,>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseRetryOptions = {}
) => {
  const { maxAttempts = 3, onError, showToast = true } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [attemptNumber, setAttemptNumber] = useState(0);
  const { toast } = useToast();

  const execute = useCallback(
    async (...args: any[]): Promise<T> => {
      setIsLoading(true);
      let lastError: ApiError | null = null;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          setAttemptNumber(attempt);
          const result = await asyncFunction(...args);
          setIsLoading(false);
          setAttemptNumber(0);
          return result;
        } catch (error) {
          const apiError = handleApiError(error);
          lastError = apiError;

          console.error(`Attempt ${attempt + 1} failed:`, apiError);

          // Check if we should retry
          if (shouldRetry(apiError, attempt) && attempt < maxAttempts - 1) {
            const delay = calculateRetryDelay(attempt);
            
            if (showToast) {
              toast({
                title: "Retrying...",
                description: `Attempt ${attempt + 2} of ${maxAttempts} in ${delay / 1000}s`,
              });
            }

            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, delay));
          } else {
            // No more retries
            break;
          }
        }
      }

      setIsLoading(false);
      setAttemptNumber(0);

      // All retries failed
      if (lastError) {
        if (showToast) {
          toast({
            title: lastError.title,
            description: lastError.message,
            variant: "destructive",
            action: lastError.action ? (
              <div className="text-xs mt-2 text-muted-foreground">
                {lastError.action}
              </div>
            ) : undefined,
          });
        }

        if (onError) {
          onError(lastError);
        }

        throw lastError;
      }

      throw new Error("Unknown error occurred");
    },
    [asyncFunction, maxAttempts, onError, showToast, toast]
  );

  return {
    execute,
    isLoading,
    attemptNumber,
  };
};
