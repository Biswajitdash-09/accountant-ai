import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook to safely check if all required contexts are available
 * Prevents context errors by verifying availability before use
 */
export const useContextGuard = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkContexts = async () => {
      try {
        // Check React Query context
        const queryClient = useQueryClient();
        if (!queryClient) {
          throw new Error("QueryClient not available");
        }

        // Check if Supabase is initialized
        const { supabase } = await import("@/integrations/supabase/client");
        if (!supabase) {
          throw new Error("Supabase client not available");
        }

        // All checks passed
        if (mounted) {
          setIsReady(true);
          setError(null);
        }
      } catch (err) {
        console.error("[ContextGuard] Context check failed:", err);
        if (mounted) {
          setError(err instanceof Error ? err.message : "Context initialization failed");
        }
      }
    };

    // Small delay to ensure providers are mounted
    const timer = setTimeout(checkContexts, 50);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  return { isReady, error };
};

/**
 * Safe wrapper for useQueryClient that won't crash if context isn't ready
 */
export const useSafeQueryClient = () => {
  try {
    return useQueryClient();
  } catch (error) {
    console.warn("[useSafeQueryClient] QueryClient not available:", error);
    return null;
  }
};
