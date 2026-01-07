import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Moon, Sun, Fingerprint } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import AuthForm from "@/components/auth/AuthForm";
import OAuthProviders from "@/components/auth/OAuthProviders";
import { useAuth } from "@/contexts/AuthContext";
import { useBiometric } from "@/contexts/BiometricContext";
import BiometricSetupWizard from "@/components/auth/BiometricSetupWizard";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { user, loading } = useAuth();
  const { isEnabled, isAvailable, unlock } = useBiometric();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const [biometricMode, setBiometricMode] = useState(false);
  const [isNewUserLogin, setIsNewUserLogin] = useState(false);
  
  useEffect(() => {
    // Check for biometric mode parameter
    const params = new URLSearchParams(location.search);
    if (params.get("biometric") === "true" && isEnabled) {
      setBiometricMode(true);
      // Auto-trigger biometric auth
      handleBiometricLogin();
    }
    
    // Redirect authenticated users to dashboard
    if (!loading && user) {
      console.log('User already authenticated, redirecting to dashboard');
      navigate("/dashboard", { replace: true });
      return;
    }

    // Check for signup parameter in URL
    if (params.get("signup") === "true") {
      setActiveTab("signup");
    }
  }, [user, loading, location.search, navigate, isEnabled]);

  const handleBiometricLogin = async () => {
    try {
      const success = await unlock();
      if (success) {
        toast({
          title: "Biometric verified",
          description: "Signing you in...",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      console.error('Biometric login failed:', error);
      setBiometricMode(false);
    }
  };

  const handleAuthSuccess = async (isNewUser = false) => {
    console.log('Auth success, isNewUser:', isNewUser);
    
    // For new signups, check if we should show biometric setup
    if (isNewUser) {
      setIsNewUserLogin(true);
      const hasSeenSetup = localStorage.getItem('biometric-setup-shown');
      if (isAvailable && !hasSeenSetup) {
        setShowBiometricSetup(true);
        return;
      }
      console.log('New user detected, redirecting to onboarding');
      navigate("/onboarding");
      return;
    }
    
    // For existing users, check if they've completed onboarding
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();
      
      if (!profile?.onboarding_completed) {
        // Show biometric setup for users who haven't seen it
        const hasSeenSetup = localStorage.getItem('biometric-setup-shown');
        if (isAvailable && !hasSeenSetup && !isEnabled) {
          setShowBiometricSetup(true);
          return;
        }
        console.log('User has not completed onboarding, redirecting');
        navigate("/onboarding");
        return;
      }
    }
    
    // Show biometric setup for existing users who haven't enabled it
    const hasSeenSetup = localStorage.getItem('biometric-setup-shown');
    if (isAvailable && !hasSeenSetup && !isEnabled) {
      setShowBiometricSetup(true);
      return;
    }
    
    console.log('Existing user with completed onboarding, navigating to dashboard');
    navigate("/dashboard");
  };

  const handleBiometricSetupComplete = () => {
    if (isNewUserLogin) {
      navigate("/onboarding");
    } else {
      navigate("/dashboard");
    }
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
                {/* Biometric Sign-in - Show if available */}
                {isAvailable && (
                  <>
                    {isEnabled ? (
                      <Button
                        onClick={handleBiometricLogin}
                        variant="outline"
                        className="w-full h-12 border-primary/50 hover:bg-primary/10"
                        disabled={isLoading}
                      >
                        <Fingerprint className="mr-2 h-5 w-5 text-primary" />
                        Sign in with Biometrics
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setShowBiometricSetup(true)}
                        variant="ghost"
                        className="w-full h-10 text-muted-foreground hover:text-primary hover:bg-primary/5"
                        disabled={isLoading}
                      >
                        <Fingerprint className="mr-2 h-4 w-4" />
                        Set up Fingerprint / Face ID
                      </Button>
                    )}
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-muted-foreground/20"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          {isEnabled ? 'or use other methods' : 'or sign in with'}
                        </span>
                      </div>
                    </div>
                  </>
                )}

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
                {/* Biometric setup prompt for new users */}
                {isAvailable && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <Fingerprint className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Quick Sign-in Available</p>
                      <p className="text-xs text-muted-foreground">Set up fingerprint or Face ID after creating your account</p>
                    </div>
                  </div>
                )}

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
                  onSuccess={() => handleAuthSuccess(true)}
                  onSwitchMode={() => setActiveTab("login")}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Biometric Setup Wizard */}
      <BiometricSetupWizard
        isOpen={showBiometricSetup}
        onClose={() => {
          setShowBiometricSetup(false);
          handleBiometricSetupComplete();
        }}
        onComplete={handleBiometricSetupComplete}
      />
    </div>
  );
};

export default Auth;
