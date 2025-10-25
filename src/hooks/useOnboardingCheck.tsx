import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to check if user has completed onboarding and redirect if needed
 * Use this in protected routes that require completed onboarding
 */
export const useOnboardingCheck = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkOnboarding = async () => {
      // Skip check during loading or if already on onboarding page
      if (loading || !user || location.pathname === "/onboarding") {
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error checking onboarding status:", error);
          return;
        }

        // Redirect to onboarding if not completed
        if (!profile?.onboarding_completed) {
          console.log("User has not completed onboarding, redirecting");
          navigate("/onboarding", { replace: true });
        }
      } catch (error) {
        console.error("Error in onboarding check:", error);
      }
    };

    checkOnboarding();
  }, [user, loading, navigate, location.pathname]);

  return { user, loading };
};
