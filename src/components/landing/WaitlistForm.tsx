import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, User, Building2 } from "lucide-react";
import confetti from "canvas-confetti";
import { WaitlistSuccess } from "./WaitlistSuccess";

export const WaitlistForm = () => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [position, setPosition] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('waitlist-signup', {
        body: {
          email,
          full_name: fullName || undefined,
          company_name: companyName || undefined,
          referral_source: 'landing_page',
        },
      });

      if (error) throw error;

      // Fire confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#8b5cf6', '#ec4899'],
      });

      setPosition(data.position);
      setTotalCount(data.totalCount);
      setShowSuccess(true);

      toast({
        title: data.isExisting ? "Already on waitlist!" : "🎉 You're on the waitlist!",
        description: `You're #${data.position} in line. Check your email for confirmation!`,
      });

    } catch (error: any) {
      console.error('Waitlist signup error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess && position && totalCount) {
    return (
      <WaitlistSuccess
        position={position}
        totalCount={totalCount}
        email={email}
        onClose={() => setShowSuccess(false)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
          <Input
            type="email"
            placeholder="Enter your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-12 text-base bg-background border-border text-foreground placeholder:text-muted-foreground"
            required
          />
        </div>
        <Button 
          type="submit" 
          size="lg" 
          disabled={isLoading}
          className="h-12 px-8 text-base font-semibold whitespace-nowrap bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Joining...
            </>
          ) : (
            "Join Waitlist"
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
          <Input
            type="text"
            placeholder="Full Name (optional)"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="pl-10 h-11 bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
          <Input
            type="text"
            placeholder="Company (optional)"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="pl-10 h-11 bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        By joining, you agree to receive updates about Accountant AI. Unsubscribe anytime.
      </p>
    </form>
  );
};