
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDemoMode } from "@/hooks/useDemoMode";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { isDemo } = useDemoMode();

  useEffect(() => {
    console.log('Protected route check - User authenticated:', !!user, 'Demo mode:', isDemo);
  }, [user, isDemo]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow access if user is authenticated OR in demo mode
  if (user || isDemo) {
    console.log('Access granted -', user ? 'authenticated user' : 'demo mode');
    return <>{children}</>;
  }

  // Redirect to auth page if not authenticated and not in demo mode
  console.log('Access denied - redirecting to auth');
  return <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
