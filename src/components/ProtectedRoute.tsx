
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('Protected route check - User authenticated:', !!user);
  }, [user]);

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

  // Only allow access if user is authenticated
  if (user) {
    console.log('Access granted - authenticated user');
    return <>{children}</>;
  }

  // Redirect to auth page if not authenticated
  console.log('Access denied - redirecting to auth');
  return <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
