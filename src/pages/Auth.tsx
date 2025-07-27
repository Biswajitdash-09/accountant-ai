
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { seedDemoData } from "@/utils/demoData";
import AuthForm from "@/components/auth/AuthForm";
import OAuthProviders from "@/components/auth/OAuthProviders";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  
  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (!loading && user) {
      console.log('User already authenticated, redirecting to dashboard');
      navigate("/dashboard", { replace: true });
      return;
    }

    // Check for signup parameter in URL
    const params = new URLSearchParams(location.search);
    if (params.get("signup") === "true") {
      setActiveTab("signup");
    }
  }, [user, loading, location.search, navigate]);

  const handleGuestLogin = async () => {
    try {
      setIsLoading(true);
      console.log('Starting guest login...');
      
      localStorage.setItem('isGuest', 'true');
      await seedDemoData(); // Seed demo data immediately
      
      toast({
        title: "Demo Mode",
        description: "You're now exploring Accountant AI with sample data!",
      });
      
      console.log('Guest login successful, navigating to dashboard');
      navigate("/dashboard");
    } catch (error) {
      console.error('Error setting up guest mode:', error);
      toast({
        title: "Error",
        description: "Failed to set up demo mode. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    console.log('Auth success, navigating to dashboard');
    navigate("/dashboard");
  };

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4">
        <div className="flex flex-col items-center space-y-4">
          <Bot className="h-10 w-10 sm:h-12 sm:w-12 text-primary animate-pulse" />
          <p className="text-muted-foreground text-sm sm:text-base">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4 py-8 relative">
      {/* Dark mode toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-10 h-9 w-9"
      >
        {theme === 'dark' ? (
          <Sun className="h-[1.2rem] w-[1.2rem]" />
        ) : (
          <Moon className="h-[1.2rem] w-[1.2rem]" />
        )}
      </Button>

      <div className="max-w-md w-full">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-4">
            <Bot className="h-10 w-10 sm:h-12 sm:w-12 text-primary mr-3" />
            <h1 className="text-3xl sm:text-4xl font-bold">Accountant AI</h1>
          </div>
          <p className="text-muted-foreground text-base sm:text-lg">AI-Powered Accounting Platform</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")} className="animate-fade-in">
          <TabsList className="grid grid-cols-2 mb-6 sm:mb-8">
            <TabsTrigger value="login" className="text-sm sm:text-base">Login</TabsTrigger>
            <TabsTrigger value="signup" className="text-sm sm:text-base">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="shadow-xl border-0 bg-background/95 backdrop-blur">
              <CardHeader className="text-center">
                <CardTitle className="text-xl sm:text-2xl">Welcome back</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Sign in to access your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <OAuthProviders
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-muted-foreground/20"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      or continue with email
                    </span>
                  </div>
                </div>
                
                <AuthForm
                  type="login"
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  onSuccess={handleAuthSuccess}
                />
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  type="button"
                  className="w-full transition-all duration-200 hover:scale-105 text-sm sm:text-base min-h-[44px]"
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                >
                  {isLoading ? "Setting up demo..." : "Try Demo Mode"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card className="shadow-xl border-0 bg-background/95 backdrop-blur">
              <CardHeader className="text-center">
                <CardTitle className="text-xl sm:text-2xl">Create an account</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Enter your details to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <OAuthProviders
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-muted-foreground/20"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      or continue with email
                    </span>
                  </div>
                </div>
                
                <AuthForm
                  type="signup"
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  onSuccess={handleAuthSuccess}
                  onSwitchMode={() => setActiveTab("login")}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
