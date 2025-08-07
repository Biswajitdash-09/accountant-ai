import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  CreditCard, 
  Smartphone, 
  Building, 
  Globe,
  Wallet,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";

interface PaymentMethod {
  id: string;
  name: string;
  icon: any;
  description: string;
  fees: string;
  processingTime: string;
  availability: string[];
}

interface CheckoutFlowProps {
  planId: string;
  planName: string;
  credits: number;
  price: number;
  onClose: () => void;
}

const EnhancedCheckoutFlow: React.FC<CheckoutFlowProps> = ({
  planId,
  planName,
  credits,
  price,
  onClose
}) => {
  const { user } = useAuth();
  const { selectedCurrency } = useCurrency();
  const { toast } = useToast();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'method' | 'processing' | 'success' | 'error'>('method');

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, American Express',
      fees: 'No additional fees',
      processingTime: 'Instant',
      availability: ['USD', 'INR', 'NGN']
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      icon: Wallet,
      description: 'PayPal, Google Pay, Apple Pay',
      fees: 'Standard processing fees apply',
      processingTime: 'Instant',
      availability: ['USD', 'INR']
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: Building,
      description: 'Direct bank account transfer',
      fees: 'Low transaction fees',
      processingTime: '1-3 business days',
      availability: ['USD', 'INR', 'NGN']
    },
    {
      id: 'mobile',
      name: 'Mobile Money',
      icon: Smartphone,
      description: 'M-Pesa, Airtel Money, MTN Money',
      fees: 'Carrier fees may apply',
      processingTime: 'Instant',
      availability: ['NGN']
    }
  ];

  const formatCurrency = (amount: number) => {
    const symbol = selectedCurrency?.code === 'USD' ? '$' : selectedCurrency?.code === 'INR' ? '₹' : '₦';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const availableMethods = paymentMethods.filter(method => 
    method.availability.includes(selectedCurrency?.code || 'USD')
  );

  const handlePurchase = async () => {
    if (!selectedPaymentMethod || !user) return;

    setIsProcessing(true);
    setStep('processing');

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planId,
          paymentMethod: selectedPaymentMethod,
          returnUrl: window.location.origin + '/pricing'
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        setStep('success');
        
        toast({
          title: "Redirecting to payment",
          description: "A new tab has opened for secure payment processing.",
        });
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      setStep('error');
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Order Summary */}
      <Card className="gradient-primary text-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-heading font-bold">{planName}</h3>
              <p className="opacity-90">{credits.toLocaleString()} Credits</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{formatCurrency(price)}</p>
              <p className="text-sm opacity-75">{selectedCurrency?.code || 'USD'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {step === 'method' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Choose Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableMethods.map((method) => (
                <div
                  key={method.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedPaymentMethod === method.id 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <method.icon className="h-6 w-6 text-primary mt-1" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{method.name}</h4>
                          {selectedPaymentMethod === method.id && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>⚡ {method.processingTime}</span>
                          <span>💳 {method.fees}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handlePurchase}
              disabled={!selectedPaymentMethod || isProcessing}
              className="flex-1 gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Complete Purchase
            </Button>
          </div>
        </motion.div>
      )}

      {step === 'processing' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <h3 className="text-xl font-heading font-bold mb-2">Processing Payment</h3>
          <p className="text-muted-foreground">
            Please wait while we securely process your payment...
          </p>
        </motion.div>
      )}

      {step === 'success' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-heading font-bold mb-2">Payment Initiated</h3>
          <p className="text-muted-foreground mb-6">
            You've been redirected to complete your secure payment. 
            Return to this page after completing the payment.
          </p>
          <Button onClick={onClose} className="mx-auto">
            Continue Shopping
          </Button>
        </motion.div>
      )}

      {step === 'error' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-heading font-bold mb-2">Payment Failed</h3>
          <p className="text-muted-foreground mb-6">
            We couldn't process your payment. Please try again or contact support.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => setStep('method')}>
              Try Again
            </Button>
          </div>
        </motion.div>
      )}

      {/* Security Notice */}
      <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-green-900 dark:text-green-100">
                Secure Payment Processing
              </p>
              <p className="text-green-700 dark:text-green-300">
                All payments are processed securely through Stripe. 
                Your payment information is encrypted and never stored on our servers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Enhanced checkout button component
interface EnhancedCheckoutButtonProps {
  planId: string;
  planName: string;
  credits: number;
  price: number;
  className?: string;
}

export const EnhancedCheckoutButton: React.FC<EnhancedCheckoutButtonProps> = ({
  planId,
  planName,
  credits,
  price,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={className}>
          Purchase Credits
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Complete Your Purchase</DialogTitle>
        </DialogHeader>
        <EnhancedCheckoutFlow
          planId={planId}
          planName={planName}
          credits={credits}
          price={price}
          onClose={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedCheckoutFlow;