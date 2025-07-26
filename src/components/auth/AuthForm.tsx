
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface AuthFormProps {
  type: "login" | "signup";
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onSuccess: () => void;
  onSwitchMode?: () => void;
}

const AuthForm = ({ type, isLoading, setIsLoading, onSuccess, onSwitchMode }: AuthFormProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

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
    
    try {
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

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Check your email to verify your account.",
      });
      
      if (onSwitchMode) {
        onSwitchMode();
      }
    } catch (error: any) {
      let errorMessage = error.message;
      
      if (error.message?.includes('already registered')) {
        errorMessage = "An account with this email already exists. Please try logging in instead.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      
      onSuccess();
    } catch (error: any) {
      let errorMessage = error.message;
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = "Please check your email and click the confirmation link before logging in.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = type === "login" ? handleLogin : handleSignUp;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {type === "signup" && (
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="transition-all duration-200 focus:scale-[1.02]"
          />
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor={`${type}-email`}>Email</Label>
        <Input
          id={`${type}-email`}
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="transition-all duration-200 focus:scale-[1.02]"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={`${type}-password`}>Password</Label>
          {type === "login" && (
            <a 
              href="#" 
              className="text-sm text-primary hover:underline transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              Forgot password?
            </a>
          )}
        </div>
        <Input
          id={`${type}-password`}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="transition-all duration-200 focus:scale-[1.02]"
          minLength={type === "signup" ? 6 : undefined}
        />
        {type === "signup" && (
          <p className="text-xs text-muted-foreground">
            Password must be at least 6 characters long
          </p>
        )}
      </div>
      
      <Button
        type="submit"
        className="w-full transition-all duration-200 hover:scale-105"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {type === "login" ? "Logging in..." : "Creating account..."}
          </>
        ) : (
          type === "login" ? "Sign In" : "Create Account"
        )}
      </Button>
    </form>
  );
};

export default AuthForm;
