
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Provider } from "@supabase/supabase-js";
import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: redirectUrl,
      }
    });

    setIsLoading(false);
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Check your email to verify your account.",
      });
      setActiveTab("login");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter your email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      navigate("/dashboard");
    }
  };

  const handleOAuthLogin = async (provider: Provider) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      }
    });
    setIsLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleGuestLogin = async () => {
    // For demo purposes - creating a temporary session
    // In a real app, you'd implement proper guest authentication
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent/10 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">IntellyFin</h1>
          <p className="text-muted-foreground mt-2">AI-Powered Accounting Platform</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")}>
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <form onSubmit={handleLogin}>
                <CardHeader>
                  <CardTitle>Welcome back</CardTitle>
                  <CardDescription>
                    Sign in to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <a 
                        href="#" 
                        className="text-sm text-primary hover:underline"
                        onClick={(e) => e.preventDefault()}
                      >
                        Forgot password?
                      </a>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-4">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                    
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
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => handleOAuthLogin("google")}
                        disabled={isLoading}
                      >
                        <FcGoogle className="mr-2 h-4 w-4" />
                        Google
                      </Button>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => handleOAuthLogin("linkedin_oidc")}
                        disabled={isLoading}
                      >
                        <FaLinkedin className="mr-2 h-4 w-4 text-blue-600" />
                        LinkedIn
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="ghost"
                    type="button"
                    className="w-full"
                    onClick={handleGuestLogin}
                  >
                    Continue as Guest
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card>
              <form onSubmit={handleSignUp}>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>
                    Enter your details to get started
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                  
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
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => handleOAuthLogin("google")}
                      disabled={isLoading}
                    >
                      <FcGoogle className="mr-2 h-4 w-4" />
                      Google
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => handleOAuthLogin("linkedin_oidc")}
                      disabled={isLoading}
                    >
                      <FaLinkedin className="mr-2 h-4 w-4 text-blue-600" />
                      LinkedIn
                    </Button>
                  </div>
                </CardContent>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
