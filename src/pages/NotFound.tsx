
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bot, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="text-center space-y-8 max-w-md mx-auto px-4">
        <div className="space-y-4">
          <div className="flex justify-center">
            <Bot className="h-20 w-20 text-primary animate-pulse" />
          </div>
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-lg text-muted-foreground">
            Oops! The page you're looking for seems to have wandered off into the digital void.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            className="transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button 
            onClick={() => navigate("/")}
            className="transition-all duration-200 hover:scale-105"
          >
            <Home className="mr-2 h-4 w-4" />
            Return Home
          </Button>
        </div>
        
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Need help? <a href="#" className="text-primary hover:underline">Contact our support team</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
