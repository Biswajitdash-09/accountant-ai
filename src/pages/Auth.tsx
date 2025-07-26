
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
import AuthForm from "@/components/auth/AuthForm";
import OAuthProviders from "@/components/auth/OAuthProviders";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  
  useEffect(() => {
    // Check for signup parameter in URL
    const params = new URLSearchParams(location.search);
    if (params.get("signup") === "true") {
      setActiveTab("signup");
    }

    // Check if user is already logged in
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/dashboard");
      }
    };

    checkUser();
  }, [location.search, navigate]);

  const handleGuestLogin = async () => {
    localStorage.setItem('isGuest', 'true');
    toast({
      title: "Demo Mode",
      description: "You're now exploring Accountant AI in demo mode.",
    });
    navigate("/dashboard");
  };

  const handleAuthSuccess = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4 relative">
      {/* Dark mode toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="absolute top-4 right-4"
      >
        {theme === 'dark' ? (
          <Sun className="h-[1.2rem] w-[1.2rem]" />
        ) : (
          <Moon className="h-[1.2rem] w-[1.2rem]" />
        )}
      </Button>

      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Bot className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold">Accountant AI</h1>
          </div>
          <p className="text-muted-foreground text-lg">AI-Powered Accounting Platform</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")} className="animate-fade-in">
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="shadow-xl border-0 bg-background/95 backdrop-blur">
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>
                  Sign in to access your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AuthForm
                  type="login"
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  onSuccess={handleAuthSuccess}
                />
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-muted-foreground/20"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      or continue with
                    </span>
                  </div>
                </div>
                
                <OAuthProviders
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  type="button"
                  className="w-full transition-all duration-200 hover:scale-105"
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                >
                  Try Demo Mode
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card className="shadow-xl border-0 bg-background/95 backdrop-blur">
              <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>
                  Enter your details to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AuthForm
                  type="signup"
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  onSuccess={handleAuthSuccess}
                  onSwitchMode={() => setActiveTab("login")}
                />
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-muted-foreground/20"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      or continue with
                    </span>
                  </div>
                </div>
                
                <OAuthProviders
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
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
