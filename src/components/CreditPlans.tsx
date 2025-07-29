
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Crown, Star, Zap, CreditCard, Smartphone, Wallet } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUserLocation } from "@/hooks/useUserLocation";
import { cn } from "@/lib/utils";

const CREDIT_PLANS = [
  {
    id: "free",
    name: "Free Plan",
    priceUSD: 0,
    priceINR: 0,
    credits: 5,
    period: "per day",
    description: "Perfect for getting started",
    features: [
      "5 credits per day",
      "Basic AI features",
      "Standard support",
      "Mobile responsive"
    ],
    icon: Star,
    color: "from-blue-500 to-cyan-500",
    popular: false,
    paymentMethods: []
  },
  {
    id: "starter",
    name: "Starter Plan",
    priceUSD: 0.10,
    priceINR: 8,
    credits: 10,
    period: "one-time",
    description: "Great for light usage",
    features: [
      "10 credits instantly",
      "Advanced AI features",
      "Priority support",
      "No daily limits",
      "Mobile responsive"
    ],
    icon: Zap,
    color: "from-green-500 to-emerald-500",
    popular: true,
    paymentMethods: ["card", "upi", "wallet"]
  },
  {
    id: "pro",
    name: "Pro Plan",
    priceUSD: 0.90,
    priceINR: 75,
    credits: 20,
    period: "one-time",
    description: "Best value for power users",
    features: [
      "20 credits instantly",
      "Premium AI features",
      "Premium support",
      "No daily limits",
      "Advanced analytics",
      "Mobile responsive"
    ],
    icon: Crown,
    color: "from-purple-500 to-pink-500",
    popular: false,
    paymentMethods: ["card", "upi", "wallet"]
  }
];

const PaymentMethodIcons = ({ methods, isIndian }: { methods: string[], isIndian: boolean }) => {
  const icons = {
    card: <CreditCard className="h-4 w-4" />,
    upi: <Smartphone className="h-4 w-4" />,
    wallet: <Wallet className="h-4 w-4" />
  };

  const displayMethods = isIndian ? methods : methods.filter(m => m === 'card');

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {displayMethods.map(method => (
        <div key={method} className="flex items-center gap-1">
          {icons[method as keyof typeof icons]}
          <span className="capitalize">{method === 'upi' ? 'UPI' : method}</span>
        </div>
      ))}
    </div>
  );
};

export const CreditPlans = () => {
  const { credits, availableCredits, dailyCreditsRemaining } = useCredits();
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { location, loading: locationLoading } = useUserLocation();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handlePurchase = async (plan: typeof CREDIT_PLANS[0]) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase credits",
        variant: "destructive",
      });
      return;
    }

    if (plan.id === "free") {
      toast({
        title: "Free Plan",
        description: "You're already on the free plan with daily credits!",
      });
      return;
    }

    setLoadingPlan(plan.id);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planId: plan.id,
          userCountry: location?.countryCode || 'US'
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const formatPrice = (plan: typeof CREDIT_PLANS[0]) => {
    if (plan.priceUSD === 0) return "Free";
    
    const price = location?.isIndian ? plan.priceINR : plan.priceUSD;
    const currency = location?.isIndian ? "₹" : "$";
    
    return `${currency}${price}`;
  };

  if (locationLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Credits Status */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Your Credits
          </CardTitle>
          {location && (
            <div className="text-sm text-muted-foreground">
              Pricing in {location.isIndian ? 'Indian Rupees (₹)' : 'US Dollars ($)'}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{availableCredits}</div>
              <div className="text-sm text-muted-foreground">Total Credits</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{dailyCreditsRemaining}</div>
              <div className="text-sm text-muted-foreground">Daily Free Credits</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CREDIT_PLANS.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = plan.id === "free" && !credits?.subscription_tier;
          
          return (
            <Card 
              key={plan.id} 
              className={cn(
                "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
                plan.popular && "ring-2 ring-primary shadow-lg scale-105",
                isCurrentPlan && "border-green-500 bg-green-50 dark:bg-green-900/10"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                  Most Popular
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className={cn(
                  "w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-gradient-to-br",
                  plan.color
                )}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="min-h-[2.5rem] flex items-center justify-center">
                  {plan.description}
                </CardDescription>
                
                <div className="space-y-2">
                  <div className="text-3xl font-bold">
                    {formatPrice(plan)}
                    {plan.priceUSD > 0 && (
                      <span className="text-sm font-normal text-muted-foreground">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {plan.credits} credits {plan.period}
                  </Badge>
                  {plan.paymentMethods.length > 0 && (
                    <PaymentMethodIcons 
                      methods={plan.paymentMethods} 
                      isIndian={location?.isIndian || false}
                    />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <Separator />
                
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handlePurchase(plan)}
                  disabled={loadingPlan === plan.id || isCurrentPlan}
                  className={cn(
                    "w-full mt-4 transition-all duration-200",
                    plan.popular && "bg-primary hover:bg-primary/90",
                    isCurrentPlan && "bg-green-500 hover:bg-green-600"
                  )}
                >
                  {loadingPlan === plan.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : isCurrentPlan ? (
                    "Current Plan"
                  ) : plan.id === "free" ? (
                    "Free Plan"
                  ) : (
                    `Purchase ${plan.credits} Credits`
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Info */}
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="text-amber-600 dark:text-amber-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium mb-1">Secure Payment Processing</p>
              <p>
                All payments are processed securely through Stripe. 
                {location?.isIndian ? " UPI, cards, and wallets are supported." : " International cards are accepted."}
                {" "}Your credits will be added instantly after successful payment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
