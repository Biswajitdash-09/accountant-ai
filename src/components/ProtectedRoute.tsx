
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    // You can add additional checks here if needed
  }, [user]);
  
  if (loading) {
    // You can replace this with a loading spinner
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    // Redirect to login page if not authenticated
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
