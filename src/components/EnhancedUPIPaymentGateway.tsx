import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone, Check, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useCreditPlans } from '@/hooks/useCreditPlans';
import UPIPayment from './UPIPayment';

const EnhancedUPIPaymentGateway = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('upi');
  const { toast } = useToast();
  const { plans, isLoading } = useCreditPlans();

  const handleStripePayment = async (plan: any) => {
    setIsProcessing(true);
    
    try {
      // Existing Stripe integration logic here
      toast({
        title: "Redirecting to Stripe",
        description: "You'll be redirected to complete your card payment.",
      });
      
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    toast({
      title: "Payment Successful!",
      description: "Your credits have been added to your account.",
    });
    setSelectedPlan('');
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="h-8 bg-muted animate-pulse rounded-lg w-64 mx-auto" />
          <div className="h-4 bg-muted animate-pulse rounded w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3"
        >
          <div className="flex gap-2">
            <CreditCard className="h-10 w-10 text-primary" />
            <Smartphone className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold">Choose Your Plan</h1>
        </motion.div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Unlock the full potential of AI-powered financial management. 
          Pay with cards or UPI for instant credit activation.
        </p>
      </div>

      {/* Payment Method Selection */}
      <div className="flex justify-center">
        <Tabs value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'card' | 'upi')}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="card" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Card Payment
            </TabsTrigger>
            <TabsTrigger value="upi" className="gap-2">
              <Smartphone className="h-4 w-4" />
              UPI Payment
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`relative h-full ${
              plan.is_popular 
                ? 'border-primary shadow-lg shadow-primary/20' 
                : 'border-border'
            }`}>
              {plan.is_popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="font-heading text-xl">{plan.plan_name}</CardTitle>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">
                    {paymentMethod === 'upi' 
                      ? `₹${plan.price_inr}`
                      : `$${plan.price_usd}`
                    }
                    <span className="text-lg font-normal text-muted-foreground">/one-time</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold">{plan.credits} Credits</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Purchase Button */}
                {selectedPlan === plan.plan_id && paymentMethod === 'upi' ? (
                  <UPIPayment
                    amount={plan.price_inr}
                    planId={plan.plan_id}
                    planName={plan.plan_name}
                    currency="INR"
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                ) : (
                  <Button
                    onClick={() => {
                      if (paymentMethod === 'upi') {
                        setSelectedPlan(plan.plan_id);
                      } else {
                        handleStripePayment(plan);
                      }
                    }}
                    disabled={isProcessing}
                    className={`w-full ${
                      plan.is_popular 
                        ? 'bg-primary hover:bg-primary/90' 
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                    variant={plan.is_popular ? 'default' : 'secondary'}
                  >
                    {isProcessing ? 'Processing...' : (
                      paymentMethod === 'upi' 
                        ? `Pay ₹${plan.price_inr} with UPI`
                        : `Pay $${plan.price_usd} with Card`
                    )}
                  </Button>
                )}

                {selectedPlan === plan.plan_id && paymentMethod === 'upi' && (
                  <Button
                    onClick={() => setSelectedPlan('')}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Cancel
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Security Notice */}
      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold">Secure Payment Processing</h3>
              <p className="text-sm text-muted-foreground">
                {paymentMethod === 'upi' 
                  ? 'UPI payments are processed securely through Cashfree. Your banking details are never stored.'
                  : 'Card payments are processed securely through Stripe. We never store your payment details.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedUPIPaymentGateway;
