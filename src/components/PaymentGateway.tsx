import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

interface PaymentPlan {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
  features: string[];
}

const PaymentGateway = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const plans: PaymentPlan[] = [
    {
      id: 'starter',
      name: 'Starter Pack',
      credits: 100,
      price: 9.99,
      features: [
        '100 AI Credits',
        'Basic Financial Analysis',
        'Document Processing',
        'Email Support'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      credits: 300,
      price: 24.99,
      popular: true,
      features: [
        '300 AI Credits',
        'Advanced Analytics',
        'Voice Recognition',
        'Priority Support',
        'Custom Reports'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      credits: 1000,
      price: 79.99,
      features: [
        '1000 AI Credits',
        'Unlimited Features',
        'API Access',
        'Dedicated Support',
        'Custom Integrations',
        'White-label Options'
      ]
    }
  ];

  const handlePurchase = async (plan: PaymentPlan) => {
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Payment Successful!",
        description: `${plan.credits} credits have been added to your account.`,
      });
      
      // In a real implementation, you would integrate with Stripe here
      console.log('Processing payment for plan:', plan);
      
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

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3"
        >
          <CreditCard className="h-10 w-10 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-heading font-bold">Choose Your Plan</h1>
        </motion.div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Unlock the full potential of AI-powered financial management. 
          Get more credits to access advanced features and insights.
        </p>
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
              plan.popular 
                ? 'border-primary shadow-lg shadow-primary/20' 
                : 'border-border'
            }`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="font-heading text-xl">{plan.name}</CardTitle>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">
                    ${plan.price}
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
                <Button
                  onClick={() => handlePurchase(plan)}
                  disabled={isProcessing}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-primary hover:bg-primary/90' 
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                  variant={plan.popular ? 'default' : 'secondary'}
                >
                  {isProcessing ? 'Processing...' : `Get ${plan.name}`}
                </Button>
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
                Your payment information is processed securely through Stripe. 
                We never store your payment details on our servers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-heading font-bold text-center">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Do credits expire?</h3>
              <p className="text-sm text-muted-foreground">
                No, purchased credits never expire. You also get 10 free daily credits that reset every day.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Can I upgrade later?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, you can purchase additional credits anytime. All credits stack together in your account.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards, debit cards, and digital wallets through Stripe.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Is there a refund policy?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;