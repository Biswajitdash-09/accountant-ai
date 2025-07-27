
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Provider } from "@supabase/supabase-js";
import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa";
import { Loader2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface OAuthProvidersProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const OAuthProviders = ({ isLoading, setIsLoading }: OAuthProvidersProps) => {
  const { toast } = useToast();
  const [oauthError, setOauthError] = useState<string | null>(null);

  const handleOAuthLogin = async (provider: Provider) => {
    console.log(`Starting ${provider} OAuth login...`);
    setIsLoading(true);
    setOauthError(null);

    try {
      const redirectTo = `${window.location.origin}/dashboard`;
      console.log(`Redirect URL: ${redirectTo}`);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      console.log('OAuth response:', { data, error });

      if (error) {
        throw error;
      }

      // OAuth flow initiated successfully
      toast({
        title: "Redirecting...",
        description: `Redirecting to ${provider === 'linkedin_oidc' ? 'LinkedIn' : 'Google'} for authentication.`,
      });

    } catch (error: any) {
      console.error(`${provider} OAuth error:`, error);
      
      let errorMessage = "Authentication failed. Please try again.";
      
      if (error.message?.includes('unauthorized_client')) {
        errorMessage = `${provider === 'linkedin_oidc' ? 'LinkedIn' : 'Google'} OAuth is not properly configured. Please contact support.`;
      } else if (error.message?.includes('access_denied')) {
        errorMessage = "Access was denied. Please try again and grant the necessary permissions.";
      } else if (error.message?.includes('network')) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setOauthError(errorMessage);
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {oauthError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{oauthError}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          type="button"
          onClick={() => handleOAuthLogin("google")}
          disabled={isLoading}
          className="transition-all duration-200 hover:scale-105 h-12 text-sm"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FcGoogle className="mr-2 h-5 w-5" />
          )}
          Google
        </Button>
        
        <Button
          variant="outline"
          type="button"
          onClick={() => handleOAuthLogin("linkedin_oidc")}
          disabled={isLoading}
          className="transition-all duration-200 hover:scale-105 h-12 text-sm"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FaLinkedin className="mr-2 h-5 w-5 text-blue-600" />
          )}
          LinkedIn
        </Button>
      </div>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default OAuthProviders;
