
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, User } from "lucide-react";
import SavedCredentialsManager from "./SavedCredentialsManager";

interface AuthFormProps {
  type: "login" | "signup";
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onSuccess: (isNewUser?: boolean) => void;
  onSwitchMode?: () => void;
}

const AuthForm = ({ type, isLoading, setIsLoading, onSuccess, onSwitchMode }: AuthFormProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  // Load saved email on component mount
  useEffect(() => {
    if (type === "login") {
      const savedEmail = localStorage.getItem('rememberedEmail');
      const shouldKeepLoggedIn = localStorage.getItem('keepLoggedIn') === 'true';
      if (savedEmail && shouldKeepLoggedIn) {
        setEmail(savedEmail);
        setKeepLoggedIn(true);
      }
    }
  }, [type]);

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

      // Save email if "Keep me logged in" is checked
      if (keepLoggedIn) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('keepLoggedIn', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('keepLoggedIn');
      }

      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      
      onSuccess(false);
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
    <div className="space-y-4">
      {type === "login" && (
        <SavedCredentialsManager
          onCredentialSelect={(selectedEmail, selectedPassword) => {
            setEmail(selectedEmail);
            setPassword(selectedPassword);
            setKeepLoggedIn(true);
          }}
          onAddCredential={(newEmail, newPassword, nickname) => {
            // Credentials are already saved in SavedCredentialsManager
          }}
        />
      )}
      
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

      {type === "login" && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="keep-logged-in"
            checked={keepLoggedIn}
            onCheckedChange={(checked) => setKeepLoggedIn(checked as boolean)}
          />
          <Label 
            htmlFor="keep-logged-in" 
            className="text-sm font-normal cursor-pointer"
          >
            Keep me logged in
          </Label>
        </div>
      )}
      
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
    </div>
  );
};

export default AuthForm;
