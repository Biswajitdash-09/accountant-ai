import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBiometric } from "@/contexts/BiometricContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { BiometricLockScreen } from "@/components/security/BiometricLockScreen";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { isLocked, isEnabled, isVerifying, unlock } = useBiometric();
  const location = useLocation();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    console.log('Protected route check - User authenticated:', !!user, 'Biometric locked:', isLocked);
  }, [user, isLocked]);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      // Skip onboarding check if on onboarding page or no user
      if (location.pathname === "/onboarding" || !user) {
        setCheckingOnboarding(false);
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
          setCheckingOnboarding(false);
          return;
        }

        // Redirect to onboarding if not completed
        if (!profile?.onboarding_completed) {
          console.log("User needs onboarding");
          setNeedsOnboarding(true);
        }
      } catch (error) {
        console.error("Error in onboarding check:", error);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    if (!loading && user) {
      checkOnboardingStatus();
    } else {
      setCheckingOnboarding(false);
    }
  }, [user, loading, location.pathname]);

  // Show loading spinner while checking authentication or onboarding
  if (loading || checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to onboarding if needed
  if (needsOnboarding && location.pathname !== "/onboarding") {
    console.log("Redirecting to onboarding");
    return <Navigate to="/onboarding" replace />;
  }

  // Allow access if user is authenticated
  if (user) {
    // Show biometric lock screen if enabled and locked
    if (isEnabled && isLocked) {
      return (
        <BiometricLockScreen
          onUnlock={unlock}
          isVerifying={isVerifying}
        />
      );
    }
    
    console.log('Access granted - authenticated user');
    return <>{children}</>;
  }

  // Redirect to auth page if not authenticated
  console.log('Access denied - redirecting to auth');
  return <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
