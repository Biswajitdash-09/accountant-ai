
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Crown, Star, Zap, CreditCard, Smartphone, Wallet, Loader2 } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCreditPlans } from "@/hooks/useCreditPlans";
import { cn } from "@/lib/utils";

const PlanIcons = {
  free: Star,
  starter: Zap,
  pro: Crown,
  enterprise: Crown
};

const PlanColors = {
  free: "from-blue-500 to-cyan-500",
  starter: "from-green-500 to-emerald-500", 
  pro: "from-purple-500 to-pink-500",
  enterprise: "from-orange-500 to-red-500"
};

const PaymentMethodIcons = ({ currencyCode }: { currencyCode: string }) => {
  const icons = {
    card: <CreditCard className="h-3 w-3" />,
    upi: <Smartphone className="h-3 w-3" />,
    wallet: <Wallet className="h-3 w-3" />
  };

  const methods = ['card'];
  if (currencyCode === 'INR') methods.push('upi');

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
      {methods.map(method => (
        <div key={method} className="flex items-center gap-1">
          {icons[method as keyof typeof icons]}
          <span className="capitalize">{method === 'upi' ? 'UPI' : method}</span>
        </div>
      ))}
    </div>
  );
};

export const EnhancedCreditPlans = () => {
  const { credits, availableCredits, dailyCreditsRemaining } = useCredits();
  const { user } = useAuth();
  const { toast } = useToast();
  const { selectedCurrency } = useCurrency();
  const { plans, isLoading, getPlanPrice } = useCreditPlans();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handlePurchase = async (plan: any) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase credits",
        variant: "destructive",
      });
      return;
    }

    if (plan.plan_type === "free") {
      toast({
        title: "Free Plan",
        description: "You're already on the free plan with daily credits!",
      });
      return;
    }

    if (!selectedCurrency) {
      toast({
        title: "Currency Error",
        description: "Please wait for currency to load",
        variant: "destructive",
      });
      return;
    }

    setLoadingPlan(plan.plan_id);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planId: plan.plan_id,
          currencyCode: selectedCurrency.code
        }
      });

      if (error) {
        console.error('Checkout error:', error);
        throw new Error(error.message || 'Failed to create checkout session');
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const formatPrice = (plan: any) => {
    if (plan.plan_type === 'free') return "Free";
    if (!selectedCurrency) return "Loading...";
    
    const price = getPlanPrice(plan, selectedCurrency.code);
    return `${selectedCurrency.symbol}${price.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
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
          {selectedCurrency && (
            <div className="text-sm text-muted-foreground">
              Pricing in {selectedCurrency.name} ({selectedCurrency.symbol})
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const IconComponent = PlanIcons[plan.plan_id as keyof typeof PlanIcons] || Star;
          const colorClass = PlanColors[plan.plan_id as keyof typeof PlanColors] || PlanColors.free;
          const isCurrentPlan = plan.plan_type === "free" && credits?.current_plan_id === 'free';
          
          return (
            <Card 
              key={plan.id} 
              className={cn(
                "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
                plan.is_popular && "ring-2 ring-primary shadow-lg scale-105",
                isCurrentPlan && "border-green-500 bg-green-50 dark:bg-green-900/10"
              )}
            >
              {plan.is_popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                  Most Popular
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <div className={cn(
                  "w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-gradient-to-br mb-4",
                  colorClass
                )}>
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                
                <CardTitle className="text-xl">{plan.plan_name}</CardTitle>
                <CardDescription className="min-h-[2.5rem] flex items-center justify-center">
                  {plan.plan_type === 'free' ? 'Perfect for getting started' : 
                   plan.plan_type === 'paid' ? 'Great for regular usage' : 'Best value for power users'}
                </CardDescription>
                
                <div className="space-y-2">
                  <div className="text-3xl font-bold">
                    {formatPrice(plan)}
                    {plan.plan_type !== 'free' && (
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        one-time
                      </span>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {plan.credits} credits {plan.plan_type === 'free' ? 'per day' : 'instantly'}
                  </Badge>
                  {plan.plan_type !== 'free' && selectedCurrency && (
                    <PaymentMethodIcons currencyCode={selectedCurrency.code} />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <Separator />
                
                <ul className="space-y-2">
                  {plan.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handlePurchase(plan)}
                  disabled={loadingPlan === plan.plan_id || isCurrentPlan}
                  className={cn(
                    "w-full mt-4 transition-all duration-200",
                    plan.is_popular && "bg-primary hover:bg-primary/90",
                    isCurrentPlan && "bg-green-500 hover:bg-green-600"
                  )}
                >
                  {loadingPlan === plan.plan_id ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Processing...
                    </>
                  ) : isCurrentPlan ? (
                    "Current Plan"
                  ) : plan.plan_type === "free" ? (
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
                {selectedCurrency?.code === 'INR' ? " Cards and UPI are supported." : 
                 selectedCurrency?.code === 'NGN' ? " Cards are supported for NGN payments." : 
                 " International cards are accepted."}
                {" "}Your credits will be added instantly after successful payment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
