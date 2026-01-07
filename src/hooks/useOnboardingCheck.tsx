import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook that was previously used for onboarding check.
 * Onboarding has been removed - users go directly to dashboard.
 */
export const useOnboardingCheck = () => {
  const { user, loading } = useAuth();
  return { user, loading };
};
