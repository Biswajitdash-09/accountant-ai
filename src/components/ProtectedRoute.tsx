
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Check if user is in guest mode
    const guestMode = localStorage.getItem('isGuest') === 'true';
    setIsGuest(guestMode);
  }, []);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow access if user is authenticated OR in guest mode
  if (user || isGuest) {
    return <>{children}</>;
  }

  // Redirect to auth page if not authenticated and not in guest mode
  return <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
