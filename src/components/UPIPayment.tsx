
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, QrCode, CreditCard, CheckCircle, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UPIPaymentProps {
  amount: number;
  planId: string;
  planName: string;
  currency?: string;
  onSuccess?: (paymentData: any) => void;
  onError?: (error: string) => void;
}

const UPIPayment: React.FC<UPIPaymentProps> = ({
  amount,
  planId,
  planName,
  currency = 'INR',
  onSuccess,
  onError
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const { toast } = useToast();

  const createUPIOrder = async () => {
    try {
      setIsProcessing(true);
      
      const { data, error } = await supabase.functions.invoke('cashfree-create-order', {
        body: {
          planId,
          amount,
          currency
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to create payment order');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setPaymentLink(data.paymentLink);
      setOrderId(data.orderId);
      
      toast({
        title: "Payment Link Created",
        description: "Click the link below to complete your UPI payment.",
      });

      // Optional: Auto-redirect to payment link
      // window.open(data.paymentLink, '_blank');

    } catch (error) {
      console.error('UPI payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create payment';
      
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const openPaymentLink = () => {
    if (paymentLink) {
      window.open(paymentLink, '_blank');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          UPI Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Details */}
        <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Plan:</span>
            <span className="font-medium">{planName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Amount:</span>
            <span className="font-bold text-lg">₹{amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Payment Method:</span>
            <Badge variant="secondary" className="gap-1">
              <Smartphone className="h-3 w-3" />
              UPI
            </Badge>
          </div>
        </div>

        {/* UPI Features */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">UPI Benefits:</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Instant payment confirmation
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              No additional charges
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Secure & encrypted
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Works with all UPI apps
            </div>
          </div>
        </div>

        {/* Payment Actions */}
        {!paymentLink ? (
          <Button
            onClick={createUPIOrder}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Payment Link...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Generate UPI Payment Link
              </div>
            )}
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Payment Link Ready</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-300">
                Order ID: {orderId}
              </p>
            </div>

            <Button
              onClick={openPaymentLink}
              className="w-full"
              size="lg"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Pay Now with UPI
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              You'll be redirected to complete payment securely
            </p>
          </motion.div>
        )}

        {/* Supported UPI Apps */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center mb-2">
            Supported UPI Apps:
          </p>
          <div className="flex justify-center gap-2 text-xs text-muted-foreground">
            <span>GooglePay</span> • <span>PhonePe</span> • <span>Paytm</span> • <span>BHIM</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UPIPayment;
